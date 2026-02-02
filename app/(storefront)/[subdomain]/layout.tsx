import { notFound } from 'next/navigation';
import { getStoreBySubdomain } from '@/lib/tenant';
import Link from 'next/link';

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

export default async function StorefrontLayout({ children, params }: StorefrontLayoutProps) {
  const { subdomain } = await params;
  const store = await getStoreBySubdomain(subdomain);
  
  if (!store) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Store Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Store Logo/Name */}
            <div className="flex items-center">
              <Link 
                href={`/${subdomain}`}
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                {store.name}
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-8">
              <Link
                href={`/${subdomain}`}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href={`/${subdomain}/products`}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Products
              </Link>
            </nav>
            
            {/* Cart Icon (placeholder for Phase 4) */}
            <div className="flex items-center">
              <button className="p-2 text-gray-500 hover:text-gray-900">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                  />
                </svg>
              </button>
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
