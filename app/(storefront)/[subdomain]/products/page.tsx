import { notFound } from 'next/navigation';
import { getStoreBySubdomain, getStoreProducts } from '@/lib/tenant';
import Image from 'next/image';

interface ProductsPageProps {
    params: Promise<{ subdomain: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
    const { subdomain } = await params;

    const store = await getStoreBySubdomain(subdomain);
    if (!store) notFound();

    const products = await getStoreProducts(store.id);

    const getDisplayPrice = (product: typeof products[0]) => {
        if (!product || !product.variants || product.variants.length === 0) return '0.00';
        const prices = product.variants.map(v => Number(v.price));
        return Math.min(...prices).toFixed(2);
    };

    const getProductImage = (product: typeof products[0]) => {
        if (product.images && product.images.length > 0 && product.images[0]) return product.images[0];
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
    };

    return (
        <div className="space-y-8">
            <div className="text-center py-8">
                <h1 className="text-3xl font-bold">{store.name} — Products</h1>
                <p className="text-sm text-gray-600">Showing {products.length} products</p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No products available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="aspect-square relative bg-gray-100">
                                <Image src={getProductImage(product)} alt={product.name} fill className="object-cover" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{product.name}</h3>
                                <p className="text-indigo-600 font-bold mt-2">${getDisplayPrice(product)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
