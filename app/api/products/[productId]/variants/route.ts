import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/products/[productId]/variants - Get all variants for a product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { userId } = await auth();
    const { productId } = awaitedParams;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify the user owns the product by checking if it belongs to their store
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: { userId: true }
        }
      }
    });

    if (!product || product.store.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized or product not found' }, { status: 403 });
    }

    // Get all variants for the product
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(variants);
  } catch (e) {
    console.error("API_PRODUCT_VARIANTS_GET_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/products/[productId]/variants - Create a new variant
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { userId } = await auth();
    const { productId } = awaitedParams;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { name, price, stock } = body;

    // Validate required fields
    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user owns the product by checking if it belongs to their store
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: { userId: true }
        }
      }
    });

    if (!product || product.store.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized or product not found' }, { status: 403 });
    }

    // Create the new variant
    const variant = await prisma.productVariant.create({
      data: {
        name,
        price,
        stock,
        productId
      }
    });

    return NextResponse.json(variant);
  } catch (e) {
    console.error("API_PRODUCT_VARIANTS_POST_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}