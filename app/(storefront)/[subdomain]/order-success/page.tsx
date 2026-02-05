import Link from 'next/link';

interface OrderSuccessPageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
  const { subdomain } = await params;
  const searchParamsObj = await searchParams;
  const orderId = searchParamsObj.orderId as string || 'unknown';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Order Confirmed!
        </h1>
        <p className="mt-4 text-base text-gray-500">
          Thank you for your order. Your order number is #{orderId}.
        </p>
        <p className="mt-2 text-base text-gray-500">
          We've sent a confirmation email with details of your order.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium text-gray-900 mb-4">What happens next?</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
              </div>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Your order has been received and is being processed.
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
              </div>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              You will receive a shipping confirmation when your order ships.
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
              </div>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Track your order using the link in your confirmation email.
            </p>
          </li>
        </ul>
      </div>

      <div className="mt-12">
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-center space-x-4">
            <Link
              href={`/${subdomain}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
            <Link
              href={`/${subdomain}/orders/${orderId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Order Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}