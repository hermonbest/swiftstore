import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// DELETE /api/products/[productId]/variants/[variantId] - Delete a specific variant
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { userId } = await auth();
    const { productId, variantId } = awaitedParams;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!productId || !variantId) {
      return NextResponse.json({ error: 'Product ID and Variant ID are required' }, { status: 400 });
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

    // Verify the variant belongs to the product
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!variant || variant.productId !== productId) {
      return NextResponse.json({ error: 'Variant not found or does not belong to this product' }, { status: 404 });
    }

    // Delete the variant
    await prisma.productVariant.delete({
      where: { id: variantId }
    });

    return NextResponse.json({ message: 'Variant deleted successfully' });
  } catch (e) {
    console.error("API_PRODUCT_VARIANT_DELETE_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}