export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Total Revenue</h2>
          <p className="text-3xl font-bold mt-2">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Orders</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Customers</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart visualization would appear here
        </div>
      </div>
    </div>
  );
}