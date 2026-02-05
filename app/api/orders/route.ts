import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

interface OrderItemData {
  variantId: string;
  quantity: number;
  priceAtPurchase: any; // Prisma Decimal type
  variantName: string;
}

// POST /api/orders - Create a new order and decrement inventory
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, customerId, items } = body;

    // Validate required fields
    if (!storeId || !customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user owns the store
    const userStore = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId
      }
    });

    if (!userStore) {
      return NextResponse.json({ error: 'Unauthorized or store not found' }, { status: 403 });
    }

    // Verify customer exists in the store
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found in this store' }, { status: 404 });
    }

    // Verify items exist and have sufficient stock
    const orderItems: OrderItemData[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const { variantId, quantity } = item;
      
      if (!variantId || !quantity || quantity <= 0) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }

      // Get the variant
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: {
            select: { storeId: true }
          }
        }
      });

      if (!variant || variant.product.storeId !== storeId) {
        return NextResponse.json({ error: `Variant ${variantId} not found in this store` }, { status: 404 });
      }

      if (variant.stock < quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${variant.name}. Requested: ${quantity}, Available: ${variant.stock}` 
        }, { status: 400 });
      }

      // Calculate price at purchase time (snapshot)
      const priceAtPurchase = variant.price;
      const itemTotal = Number(priceAtPurchase) * quantity;
      
      orderItems.push({
        variantId,
        quantity,
        priceAtPurchase,
        variantName: variant.name
      });
      
      totalAmount += itemTotal;
    }

    // Create the order in a transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          storeId,
          customerId,
          totalAmount: totalAmount,
          status: 'PENDING',
          items: {
            create: orderItems.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
              variantName: item.variantName
            }))
          }
        },
        include: {
          items: true
        }
      });

      // Decrement stock for each ordered item
      for (const item of orderItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (e) {
    console.error("API_ORDERS_POST_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}