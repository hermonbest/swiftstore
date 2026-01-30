import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    // If not logged in, redirect will be handled by child components
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  SwiftStore
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/stores"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  My Stores
                </Link>
                <Link
                  href="/dashboard/products"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Products
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Orders
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <nav className="md:w-64 md:mr-8 mb-6 md:mb-0">
              <div className="bg-white shadow overflow-hidden rounded-md text-gray-900">
                <ul className="divide-y divide-gray-200">
                  <li>
                    <Link
                      href="/dashboard"
                      className="block hover:bg-gray-50 px-4 py-3 text-base font-medium text-gray-900"
                    >
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/stores"
                      className="block hover:bg-gray-50 px-4 py-3 text-base font-medium text-gray-900"
                    >
                      My Stores
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/products"
                      className="block hover:bg-gray-50 px-4 py-3 text-base font-medium text-gray-900"
                    >
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/orders"
                      className="block hover:bg-gray-50 px-4 py-3 text-base font-medium text-gray-900"
                    >
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/analytics"
                      className="block hover:bg-gray-50 px-4 py-3 text-base font-medium text-gray-900"
                    >
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/settings"
                      className="block hover:bg-gray-50 px-4 py-3 text-base font-medium text-gray-900"
                    >
                      Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 text-gray-900">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}