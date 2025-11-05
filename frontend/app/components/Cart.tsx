"use client";

import React, { useState } from "react";
import { X, Minus, Plus, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { getImageUrl, PLACEHOLDER_IMAGE } from "../utils/image";

import { Product } from "../page";

export interface CartItem
  extends Pick<Product, "id" | "name" | "price" | "main_image"> {
  quantity: number;
}

// Helper function to create a CartItem
export const createCartItem = (
  product: Product,
  quantity: number = 1
): CartItem => ({
  id: product.id,
  name: product.name,
  price: product.price,
  main_image: product.main_image,
  quantity,
});

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [id]: true }));
      await onUpdateQuantity(id, quantity);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [id]: true }));
      await onRemoveItem(id);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Close button moved to top-right corner */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors bg-white/80 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto sm:p-6 pt-14">
            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border sm:rounded-lg"
                  >
                    <img
                      src={
                        getImageUrl(item.main_image) ||
                        "/images/placeholder-shower.svg"
                      }
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-shower.svg";
                      }}
                    />

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-primary-600 font-bold">
                        ₺{item.price ? Number(item.price).toFixed(2) : "0.00"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={isUpdating[item.id]}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        {isUpdating[item.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </button>

                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isUpdating[item.id]}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        {isUpdating[item.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating[item.id]}
                        className="p-1 hover:bg-red-100 text-red-600 rounded ml-2 disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        {isUpdating[item.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₺{total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-accent to-secondary-light text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-accent/20 active:scale-95"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
