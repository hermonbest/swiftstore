"use client";
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface ProductVariant {
  id: string;
  name: string;
  price: number | string;
  stock: number | string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  createdAt: string;
  variants: ProductVariant[];
}

export default function ProductsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get the first variant of a product
  const getFirstVariant = (product: Product) => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : null;
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchProducts();
  }, [isLoaded, isSignedIn, router]);

  const fetchProducts = async () => {
    try {
      // Get user's store ID first
      const storeRes = await fetch(`/api/users/${user?.id}/store`);
      if (!storeRes.ok) {
        throw new Error('Failed to fetch store');
      }

      const storeData = await storeRes.json();
      if (!storeData.storeId) {
        throw new Error('No store found for user');
      }

      // Fetch products for the user's store
      const res = await fetch(`/api/stores/${storeData.storeId}/products`);
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return <div className="p-8 text-gray-900">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <main className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-gray-900 text-2xl font-semibold">Products</h1>
        <a
          href="/dashboard/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Add Product
        </a>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No products yet. Create your first product to get started.</p>
          <a
            href="/dashboard/products/new"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Create Product
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white text-gray-900">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                </div>
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                )}
              </div>

              <div className="mt-4 flex justify-between items-center">
                {(() => {
                  const firstVariant = getFirstVariant(product);
                  return (
                    <>
                      <span className="font-medium text-gray-900">${firstVariant ? (typeof firstVariant.price === 'number' ? firstVariant.price.toFixed(2) : parseFloat(firstVariant.price).toFixed(2)) : '0.00'}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        firstVariant && (typeof firstVariant.stock === 'number' ? firstVariant.stock : parseInt(firstVariant.stock)) > 10
                          ? 'bg-green-100 text-green-800'
                          : firstVariant && (typeof firstVariant.stock === 'number' ? firstVariant.stock : parseInt(firstVariant.stock)) > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {firstVariant ? `${typeof firstVariant.stock === 'number' ? firstVariant.stock : parseInt(firstVariant.stock)} in stock` : '0 in stock'}
                      </span>
                    </>
                  );
                })()}
              </div>

              <div className="mt-4 flex space-x-2">
                <a
                  href={`/dashboard/products/${product.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Edit
                </a>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );

  async function handleDelete(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh the product list
      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the product');
      console.error(err);
    }
  }
}