import { notFound } from 'next/navigation';
import { getStoreBySubdomain } from '@/lib/tenant';
import Link from 'next/link';
import { CartProvider } from '@/contexts/CartContext';
import { TenantProvider } from '@/components/tenant-provider';
import { CartIcon } from './CartIcon';

/**
 * Storefront Layout
 *
 * This layout is used for all store-specific pages accessed via subdomain.
 * It loads the store data and provides a customer-facing interface.
 */

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const store = await getStoreBySubdomain(subdomain);

  if (!store) {
    return {
      title: 'Store Not Found',
    };
  }

  return {
    title: `${store.name} - SwiftStore`,
    description: `Shop at ${store.name}`,
  };
}

// Define serialized store type for client components
type SerializedStore = Omit<NonNullable<Awaited<ReturnType<typeof getStoreBySubdomain>>>, 'products'> & {
  products: Array<Omit<NonNullable<Awaited<ReturnType<typeof getStoreBySubdomain>>>['products'][0], 'variants'> & {
    variants: Array<Omit<NonNullable<Awaited<ReturnType<typeof getStoreBySubdomain>>>['products'][0]['variants'][0], 'price'> & {
      price: number;
    }>;
  }>;
};

// Wrapper component to provide cart context
function StorefrontLayoutWrapper({
  children,
  subdomain,
  store
}: {
  children: React.ReactNode;
  subdomain: string;
  store: SerializedStore;
}) {

  return (
    <div className="min-h-screen bg-white">
      {/* Store Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Store Logo/Name */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                {store.name}
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Products
              </Link>
            </nav>

            {/* Cart Icon */}
            <div className="flex items-center">
              <CartIcon />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Store Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {store.name}. Powered by SwiftStore.
            </p>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Create your own store
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default async function StorefrontLayout({ children, params }: StorefrontLayoutProps) {
  const { subdomain } = await params;
  const store = await getStoreBySubdomain(subdomain);

  if (!store) {
    notFound();
  }

  // Serialize store data to convert Decimal to number for client components
  const serializedStore = {
    ...store,
    products: store.products.map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        price: Number(variant.price)
      }))
    }))
  };

  return (
    <TenantProvider initialStoreId={store.id} initialSubdomain={store.subdomain}>
      <CartProvider>
        <StorefrontLayoutWrapper subdomain={subdomain} store={serializedStore}>
          {children}
        </StorefrontLayoutWrapper>
      </CartProvider>
    </TenantProvider>
  );
}
