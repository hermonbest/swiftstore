'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useTenant } from '@/components/tenant-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();
  const { subdomain } = useTenant();
  const router = useRouter();

  const handleCheckout = () => {
    // Redirect to checkout page
    router.push(`/${subdomain}/checkout`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <Link
            href={`/${subdomain}/products`}
            className="mt-4 inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="min-w-0 flex-1 md:grid md:grid-cols-3 md:gap-4">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 md:mt-0">
                          <div className="flex items-center">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-200 rounded-l text-gray-700"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3 py-1 bg-gray-100 text-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-200 rounded-r text-gray-700"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900">${getTotalPrice().toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-900">$0.00</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-600">Tax</p>
                  <p className="text-gray-900">$0.00</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <p className="text-lg font-medium text-gray-900">Total</p>
                  <p className="text-lg font-bold text-gray-900">${getTotalPrice().toFixed(2)}</p>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Proceed to Checkout
              </button>
              
              <Link
                href={`/${subdomain}/products`}
                className="mt-3 block w-full text-center bg-white py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}