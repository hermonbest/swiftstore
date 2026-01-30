import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/stores/[storeId]/products - Get all products for a specific store
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { userId } = await auth();
    const { storeId } = awaitedParams;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    // Verify the user owns the store
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { userId: true }
    });

    if (!store || store.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized or store not found' }, { status: 403 });
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
    console.error("API_STORES_PRODUCT_GET_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}