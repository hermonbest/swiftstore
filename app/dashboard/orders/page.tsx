import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) {
    // This will be handled by the layout
    return null;
  }

  // Get user's store
  const userWithStore = await prisma.user.findUnique({
    where: { id: userId },
    select: { stores: { select: { id: true } } }
  });

  if (!userWithStore || userWithStore.stores.length === 0) {
    return (
      <div className="p-8 text-gray-900">
        <h1 className="text-gray-900 text-2xl font-semibold mb-6">Orders</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No store found. Please create a store first.</p>
          <a
            href="/dashboard/stores/new"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Create Store
          </a>
        </div>
      </div>
    );
  }

  const storeId = userWithStore.stores[0].id;

  // Get orders for the store
  const orders = await prisma.order.findMany({
    where: { storeId },
    include: {
      customer: true,
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 text-gray-900">
      <h1 className="text-gray-900 text-2xl font-semibold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md text-gray-900">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">#{order.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {order.createdAt.toLocaleDateString()} • {order.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</p>
                    <p className="text-sm text-gray-500">{order.customer.email}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Items:</h3>
                  <ul className="mt-2 space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{item.variant.product.name}</span> - {item.variantName}
                        </div>
                        <div>
                          <span className="text-gray-900">{item.quantity} × ${item.priceAtPurchase ? item.priceAtPurchase.toFixed(2) : '0.00'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}