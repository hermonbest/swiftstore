import { notFound } from 'next/navigation';
import { getStoreBySubdomain } from '@/lib/tenant';
import prisma  from '@/lib/prisma';
import Image from 'next/image';
import { AddToCartButton } from '@/components/AddToCartButton';

interface ProductDetailPageProps {
    params: Promise<{ subdomain: string; productId: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { subdomain, productId } = await params;

    // Fetch store and product
    const store = await getStoreBySubdomain(subdomain);
    
    if (!store) {
        notFound();
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId,
            storeId: store.id,
        },
        include: {
            variants: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    stock: true,
                },
            },
        },
    });

    if (!product) {
        notFound();
    }

    // Convert Decimal prices to numbers for client components
    const productWithNumericPrices = {
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price)
        }))
    };

    // Get default image or placeholder
    const getProductImage = (image?: string): string => {
        if (image) {
            return image;
        }
        // SVG placeholder as data URI
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
    };

    // Calculate the display price (lowest variant price)
    const getDisplayPrice = (): string => {
        if (productWithNumericPrices.variants.length === 0) return '0.00';
        const prices = productWithNumericPrices.variants.map(v => v.price);
        const minPrice = Math.min(...prices);
        return minPrice.toFixed(2);
    };

    // Find highest price for display range
    const getMaxPrice = (): string => {
        if (productWithNumericPrices.variants.length === 0) return '0.00';
        const prices = productWithNumericPrices.variants.map(v => v.price);
        const maxPrice = Math.max(...prices);
        return maxPrice.toFixed(2);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white">
                <div className="pt-6 pb-16 sm:pb-24">
                    <div className="mx-auto mt-8 max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                        <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
                            <div className="lg:col-span-5 lg:col-start-8">
                                <div className="flex justify-between">
                                    <h1 className="text-xl font-medium text-gray-900">{productWithNumericPrices.name}</h1>
                                    <p className="text-xl font-bold text-gray-900">
                                        ${getDisplayPrice()}
                                        {productWithNumericPrices.variants.length > 1 && ` - $${getMaxPrice()}`}
                                    </p>
                                </div>
                            </div>

                            {/* Image gallery */}
                            <div className="mt-8 lg:col-span-4 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
                                <h2 className="sr-only">Images</h2>
                                <div className="relative aspect-square overflow-hidden rounded-lg">
                                    <Image
                                        src={getProductImage(productWithNumericPrices.images?.[0])}
                                        alt={productWithNumericPrices.name}
                                        fill
                                        className="object-cover object-center"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 lg:col-span-5 lg:col-start-8">
                                <div>
                                    <h2 className="text-sm font-medium text-gray-900">Description</h2>
                                    <div className="prose prose-sm mt-4 text-gray-900">
                                        <p className="font-bold">{productWithNumericPrices.description}</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h2 className="text-sm font-medium text-gray-900">Variants</h2>
                                    <div className="mt-4 space-y-4">
                                        {productWithNumericPrices.variants.map((variant) => (
                                            <div key={variant.id} className="flex items-center justify-between border-b pb-4">
                                                <div>
                                                    <h3 className="text-base font-medium text-gray-900">{variant.name}</h3>
                                                    <p className="mt-1 text-sm font-bold text-gray-900">
                                                        ${variant.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add to Cart Section */}
                                <div className="mt-10">
                                    <AddToCartButton
                                        productId={productWithNumericPrices.id}
                                        productName={productWithNumericPrices.name}
                                        variants={productWithNumericPrices.variants}
                                    />
                                </div>

                                <div className="mt-6 flex items-center">
                                    <p className="text-sm text-gray-600">Free shipping on orders over $50</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}