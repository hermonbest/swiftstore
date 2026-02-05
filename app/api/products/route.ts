import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { requireTenant, verifyStoreOwnership } from '@/lib/tenant';

// GET /api/products - Get all products for a user's store
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the user's store
    const userWithStore = await prisma.user.findUnique({
      where: { id: userId },
      select: { stores: { select: { id: true } } }
    });

    if (!userWithStore || userWithStore.stores.length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const storeId = userWithStore.stores[0]!.id; // Assuming user has one store

    // Verify the user owns the store
    const isOwner = await verifyStoreOwnership(storeId, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get products for the store
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products });
  } catch (e) {
    console.error("API_PRODUCTS_GET_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, stock, images = [], storeId } = body;

    // Validate required fields
    if (!name || !description || price === undefined || stock === undefined) {
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

    // Create the product with its first variant
    const product = await prisma.product.create({
      data: {
        name,
        description,
        images: images || [],
        storeId,
        variants: {
          create: {
            name: 'Default', // Default variant name
            price: price,
            stock: stock
          }
        }
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json(product);
  } catch (e) {
    console.error("API_PRODUCTS_POST_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}