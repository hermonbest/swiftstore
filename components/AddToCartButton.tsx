'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  variants: ProductVariant[];
}

export function AddToCartButton({ productId, productName, variants }: AddToCartButtonProps) {
  // Convert any Decimal prices to numbers
  const numericVariants = variants.map(variant => ({
    ...variant,
    price: Number(variant.price)
  }));

  const { addItem } = useCart();
  // Auto-select the variant if there's only one
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    numericVariants.length === 1 && numericVariants[0] ? numericVariants[0].id : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select a variant');
      return;
    }

    const variant = numericVariants.find(v => v.id === selectedVariant);
    if (!variant) return;

    if (variant.stock < quantity) {
      alert(`Only ${variant.stock} items available`);
      return;
    }

    addItem({
      id: `${productId}-${selectedVariant}`,
      productId,
      variantId: selectedVariant,
      name: `${productName} - ${variant.name}`,
      price: variant.price,
      quantity,
      image: '', // Will be added later if needed
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
  };

  // Determine if all variants are out of stock
  const allOutOfStock = numericVariants.every(v => v.stock === 0);

  return (
    <div className="space-y-4">
      {numericVariants.length > 1 && (
        <div>
          <label htmlFor="variant" className="block text-sm font-medium text-gray-700 mb-1">
            Select Variant
          </label>
          <select
            id="variant"
            value={selectedVariant || ''}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Choose a variant</option>
            {numericVariants.map((variant) => (
              <option
                key={variant.id}
                value={variant.id}
                disabled={variant.stock === 0}
              >
                {variant.name} - ${variant.price.toFixed(2)} {variant.stock === 0 ? '(Out of Stock)' : `(${variant.stock} left)`}
              </option>
            ))}
          </select>
        </div>
      )}

      {!allOutOfStock && (
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={selectedVariant ? numericVariants.find(v => v.id === selectedVariant)?.stock : 10}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(Number(e.target.value), selectedVariant ? numericVariants.find(v => v.id === selectedVariant)?.stock || 10 : 10))}
              className="w-20 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 font-bold"
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || allOutOfStock}
            className={`mt-6 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              (!selectedVariant || allOutOfStock) ? 'opacity-50 cursor-not-allowed' : ''
            } ${isAdded ? 'bg-green-600' : ''}`}
          >
            {isAdded ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      )}

      {allOutOfStock && (
        <div className="mt-6">
          <p className="text-red-600 font-medium">This product is currently out of stock</p>
        </div>
      )}
    </div>
  );
}