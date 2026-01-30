"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import { MockUploadService } from '@/lib/uploadthing';
import type { UploadedFile } from '@/lib/uploadthing';

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  variants: Variant[];
}

interface Variant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export default function EditProductPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    images: [] as string[],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({
    name: '',
    price: '',
    stock: '0',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'product' | 'variants'>('product');

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !productId) return;

    fetchProduct();
  }, [isLoaded, isSignedIn, productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await res.json();

      setProductData({
        name: data.name,
        description: data.description,
        images: data.images || [],
      });

      setVariants(data.variants || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded = await MockUploadService.uploadFiles(selectedFiles);
      setUploadedFiles(prev => [...prev, ...uploaded]);
      setSelectedFiles([]); // Clear selected files after upload

      // Reset file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading images');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (url: string) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url)
    }));
  };

  const handleNewVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVariant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate form data
      if (!newVariant.name.trim()) {
        throw new Error('Variant name is required');
      }

      if (isNaN(parseFloat(newVariant.price)) || parseFloat(newVariant.price) <= 0) {
        throw new Error('Valid price is required');
      }

      if (isNaN(parseInt(newVariant.stock)) || parseInt(newVariant.stock) < 0) {
        throw new Error('Stock must be a non-negative number');
      }

      // Create the new variant
      const res = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVariant.name,
          price: parseFloat(newVariant.price),
          stock: parseInt(newVariant.stock),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to add variant');
      }

      // Add the new variant to the local state
      const newVariantData = await res.json();
      setVariants([...variants, newVariantData]);

      // Reset the form
      setNewVariant({
        name: '',
        price: '',
        stock: '0',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the variant');
      console.error(err);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!productData.name.trim()) {
        throw new Error('Product name is required');
      }

      if (!productData.description.trim()) {
        throw new Error('Product description is required');
      }

      // Update the product with all images (existing + newly uploaded)
      const allImages = [
        ...productData.images,
        ...uploadedFiles.map(f => f.url)
      ];

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH', // Using PATCH for product details only
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          images: allImages,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to update product');
      }

      router.push('/dashboard/products');
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete variant');
      }

      // Remove the variant from the local state
      setVariants(variants.filter(v => v.id !== variantId));
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the variant');
      console.error(err);
    }
  };

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Tabs for Product Info and Variants */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('product')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'product'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('variants')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'variants'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Variants ({variants.length})
          </button>
        </nav>
      </div>

      {activeTab === 'product' && (
        <form onSubmit={handleUpdateProduct} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleProductChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleProductChange}
              rows={4}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter product description"
              required
            ></textarea>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-gray-500 mb-2">Drag and drop images here, or click to select</p>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                  Select Images
                </button>
                <p className="text-sm text-gray-400 mt-2">Supports JPG, PNG, GIF up to 5MB each</p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Selected files:</p>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  <ul className="text-sm text-gray-600">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="truncate">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}

              {(productData.images.length > 0 || uploadedFiles.length > 0) && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Current Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {productData.images.map((image, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={image}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(image)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {uploadedFiles.map((file, index) => (
                      <div key={`uploaded-${index}`} className="relative group">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="text-xs truncate mt-1">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>

            <a
              href="/dashboard/products"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>
      )}

      {activeTab === 'variants' && (
        <div className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Add New Variant</h2>
            <form onSubmit={handleAddVariant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Variant Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newVariant.name}
                  onChange={handleNewVariantChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Large / Red"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)*</label>
                  <input
                    type="number"
                    name="price"
                    value={newVariant.price}
                    onChange={handleNewVariantChange}
                    min="0.01"
                    step="0.01"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={newVariant.stock}
                    onChange={handleNewVariantChange}
                    min="0"
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                  Add Variant
                </button>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Existing Variants</h2>
            {variants.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No variants added yet. Add your first variant above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {variants.map((variant) => (
                      <tr key={variant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{variant.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${variant.price ? variant.price.toFixed(2) : '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{variant.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}