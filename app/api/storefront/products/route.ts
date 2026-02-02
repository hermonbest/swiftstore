import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import prisma from '@/lib/prisma';

// GET /api/storefront/products - Get products for the current tenant (public storefront)
export async function GET(req: NextRequest) {
  try {
    // Get tenant context from headers (set by middleware)
    const tenant = await requireTenant();
    
    // Get products for the current store (tenant)
    const products = await prisma.product.findMany({
      where: { 
        storeId: tenant.storeId,
        // Only return published products to the storefront
        published: true
      },
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
    console.error("API_STOREFRONT_PRODUCTS_GET_ERROR:", e);
    
    if ((e as Error).message.includes('Tenant context not found')) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/storefront/products - Create a product in the current tenant's store
export async function POST(req: NextRequest) {
  try {
    // Get tenant context from headers (set by middleware)
    const tenant = await requireTenant();
    
    const body = await req.json();
    const { name, description, price, stock, images = [], variants = [] } = body;

    // Validate required fields
    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the product with its variants
    const product = await prisma.product.create({
      data: {
        name,
        description,
        images: images || [],
        storeId: tenant.storeId, // Ensure product belongs to current tenant
        published: false, // Products start unpublished
        variants: {
          create: variants.length > 0 
            ? variants 
            : [{
                name: 'Default', // Default variant name
                price: price,
                stock: stock
              }]
        }
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json(product);
  } catch (e) {
    console.error("API_STOREFRONT_PRODUCTS_POST_ERROR:", e);
    
    if ((e as Error).message.includes('Tenant context not found')) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}