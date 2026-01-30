export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl text-gray-900">
      <h1 className="text-gray-900 text-2xl font-semibold mb-6">Settings</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6 text-gray-900">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Store Information</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              defaultValue="My Store"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
              rows={3}
              defaultValue="A description of my store"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Subdomain</label>
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-gray-900"
                defaultValue="my-store"
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                .swiftstore.dev
              </span>
            </div>
          </div>
          <div className="pt-4">
            <button
              type="button"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6 text-gray-900">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h2>
        <p className="text-gray-600 mb-4">Configure your payment gateway settings here.</p>
        <button
          type="button"
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Configure Payment Gateway
        </button>
      </div>
    </div>
  );
}