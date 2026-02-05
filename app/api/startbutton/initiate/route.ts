// app/api/startbutton/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// POST /api/startbutton/initiate - Initiate a Startbutton payment
export async function POST(req: NextRequest) {
  try {
    // Note: In a real implementation, we wouldn't require auth for this endpoint
    // as it's called from the storefront by customers. This is just for demo purposes.
    const body = await req.json();
    const { 
      storeId, 
      customerId, 
      items, 
      customerEmail, 
      customerPhone,
      returnUrl,
      cancelUrl
    } = body;

    // Validate required fields
    if (!storeId || !customerId || !items || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
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
    const orderItems: {
      variantId: string;
      quantity: number;
      priceAtPurchase: any; // Prisma Decimal type
      variantName: string;
    }[] = [];
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

    // Generate payment ID before order creation
    const tempPaymentId = `sb_${Date.now()}_${Date.now()}`; // Temporary payment ID
    
    // Create a temporary order with PENDING status
    const order = await prisma.order.create({
      data: {
        storeId,
        customerId,
        totalAmount: totalAmount,
        status: 'PENDING',
        paymentId: tempPaymentId,
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

    // Use the actual payment ID with order ID
    const paymentId = `sb_${Date.now()}_${order.id}`; // Mock payment ID
    
    // Update the order with the final payment ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId }
    });

    // In a real implementation, we would call Startbutton's API here to initiate the payment
    // For now, we'll simulate the response with mock data

    // Mock Startbutton payment initiation response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const startbuttonResponse = {
      paymentId: paymentId, // Use the payment ID we created
      amount: totalAmount,
      currency: 'USD', // Default currency
      redirectUrl: `${baseUrl}/api/startbutton/process?paymentId=${encodeURIComponent(paymentId)}`,
      orderId: order.id,
      status: 'initiated'
    };

    return NextResponse.json(startbuttonResponse);
  } catch (e) {
    console.error("API_STARTBUTTON_INITIATE_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}