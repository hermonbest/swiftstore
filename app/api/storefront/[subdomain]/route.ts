import { NextRequest, NextResponse } from 'next/server';
import { getStoreBySubdomain } from '@/lib/tenant';

/**
 * GET /api/storefront/[subdomain]
 * 
 * Public endpoint to fetch store data by subdomain.
 * Used by the storefront to load store information.
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const awaitedParams = await params;
        const { subdomain } = awaitedParams;

        if (!subdomain) {
            return NextResponse.json(
                { error: 'Subdomain is required' },
                { status: 400 }
            );
        }

        const store = await getStoreBySubdomain(subdomain);

        if (!store) {
            return NextResponse.json(
                { error: 'Store not found' },
                { status: 404 }
            );
        }

        // Return store data (exclude sensitive fields)
        return NextResponse.json({
            id: store.id,
            name: store.name,
            subdomain: store.subdomain,
            logo: store.logo,
            products: store.products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                images: product.images,
                type: product.type,
                variants: product.variants.map(variant => ({
                    id: variant.id,
                    name: variant.name,
                    price: variant.price,
                    stock: variant.stock,
                })),
            })),
        });
    } catch (error) {
        console.error('[API_STOREFRONT_GET_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
