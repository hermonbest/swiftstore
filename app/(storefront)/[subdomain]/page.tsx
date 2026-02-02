import { notFound } from 'next/navigation';
import { getStoreBySubdomain, getStoreProducts } from '@/lib/tenant';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Storefront Home Page
 * 
 * Displays the store's products in a grid layout.
 * Accessed via subdomain.swiftstore.com
 */

interface StorefrontPageProps {
    params: Promise<{ subdomain: string }>;
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
    const { subdomain } = await params;

    // Fetch store with products
    const store = await getStoreBySubdomain(subdomain);

    if (!store) {
        notFound();
    }

    // Get products for this store
    const products = await getStoreProducts(store.id);

    // Calculate the display price (lowest variant price)
    const getDisplayPrice = (product: typeof products[0]): string => {
        if (product.variants.length === 0) return '0.00';
        const prices = product.variants.map(v => Number(v.price));
        const minPrice = Math.min(...prices);
        return minPrice.toFixed(2);
    };

    // Get default image or placeholder
    const getProductImage = (product: typeof products[0]): string => {
        if (product.images && product.images.length > 0 && product.images[0]) {
            return product.images[0];
        }
        // SVG placeholder as data URI
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
    };

    return (
        <div className="space-y-8">
            {/* Store Header Section */}
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {store.name}
                </h1>
                {store.logo && (
                    <div className="flex justify-center mb-4">
                        <Image
                            src={store.logo}
                            alt={`${store.name} logo`}
                            width={100}
                            height={100}
                            className="rounded-full"
                        />
                    </div>
                )}
                <p className="text-lg text-gray-600">
                    Welcome to our store! Browse our collection below.
                </p>
            </div>

            {/* Products Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Products ({products.length})
                </h2>

                {products.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            No products available yet. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Product Image */}
                                <div className="aspect-square relative bg-gray-100">
                                    <Image
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {product.name}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {product.description}
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-indigo-600">
                                            ${getDisplayPrice(product)}
                                        </span>

                                        {/* Variant Count */}
                                        {product.variants.length > 1 && (
                                            <span className="text-sm text-gray-500">
                                                {product.variants.length} options
                                            </span>
                                        )}
                                    </div>

                                    {/* Add to Cart Button (Phase 4) */}
                                    <button
                                        className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={product.variants.every(v => v.stock === 0)}
                                    >
                                        {product.variants.every(v => v.stock === 0)
                                            ? 'Out of Stock'
                                            : 'Add to Cart'
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Store Info Footer */}
            <div className="border-t border-gray-200 pt-8 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">About {store.name}</h3>
                        <p className="text-sm text-gray-600">
                            Shop with us for quality products and excellent service.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Customer Service</h3>
                        <p className="text-sm text-gray-600">
                            Contact us for any questions or concerns about your order.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Secure Shopping</h3>
                        <p className="text-sm text-gray-600">
                            Your payment information is processed securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
