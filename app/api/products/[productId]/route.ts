import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/products/[productId] - Get a specific product
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
        },
        variants: true
      }
    });

    if (!product || product.store.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized or product not found' }, { status: 403 });
    }

    return NextResponse.json(product);
  } catch (e) {
    console.error("API_PRODUCTS_GET_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/products/[productId] - Update a product
export async function PUT(
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
    const { name, description, price, stock, images } = body;

    // Validate required fields
    if (!name || !description || price === undefined || stock === undefined) {
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

    // Update the product and its default variant
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        images: images || product.images,
        variants: {
          updateMany: {
            where: { name: 'Default' }, // Update the default variant
            data: {
              price: price,
              stock: stock
            }
          }
        }
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (e) {
    console.error("API_PRODUCTS_PUT_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/products/[productId] - Delete a product
export async function DELETE(
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

    // Delete the product (this will also delete related variants due to CASCADE)
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (e) {
    console.error("API_PRODUCTS_DELETE_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}