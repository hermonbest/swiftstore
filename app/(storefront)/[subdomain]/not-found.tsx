import Link from 'next/link';

/**
 * Storefront 404 Not Found Page
 * 
 * Displayed when a store subdomain doesn't exist.
 */

export default function StoreNotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Store Not Found
                </h2>
                <p className="text-gray-600 mb-8">
                    The store you're looking for doesn't exist or has been removed.
                </p>
                <div className="space-y-4">
                    <Link
                        href="/"
                        className="block w-full bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 transition-colors"
                    >
                        Go to SwiftStore Home
                    </Link>
                    <Link
                        href="/dashboard/stores/new"
                        className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded hover:bg-gray-50 transition-colors"
                    >
                        Create Your Own Store
                    </Link>
                </div>
            </div>
        </div>
    );
}
