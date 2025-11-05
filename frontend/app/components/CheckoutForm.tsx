"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Product } from "../page";
import { getImageUrl } from "../utils/image";

export interface CartItem
  extends Pick<Product, "id" | "name" | "price" | "main_image"> {
  quantity: number;
}

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

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface OrderData {
  email: string;
  phone: string;
  notes: string;
  items: OrderItem[];
}

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSubmitOrder: (orderData: OrderData) => Promise<void>;
}

interface FormData {
  email: string;
  phone: string;
  notes: string;
}

const initialFormData: FormData = {
  email: "",
  phone: "",
  notes: "",
};

export default function CheckoutForm({
  isOpen,
  onClose,
  items,
  onSubmitOrder,
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    const phoneRegex = /^\+?[0-9\s-()]{10,}$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (min 10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderData: OrderData = {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim(),
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      await onSubmitOrder(orderData);
      setFormData(initialFormData);
      onClose();
    } catch (error) {
      console.error("Order submission failed:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Enhanced debug logging
  console.group("🔄 CheckoutForm Debug Info");
  console.log("🔍 Environment Variables:", {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "Not set!",
    NODE_ENV: process.env.NODE_ENV || "development",
  });

  console.log(
    "🛒 Cart Items:",
    items.length > 0
      ? items.map((item) => ({
          "Product ID": item.id,
          Name: item.name,
          "Main Image Path": item.main_image || "No image path",
          "Generated URL": getImageUrl(item.main_image),
          "Has Image": !!item.main_image,
        }))
      : "No items in cart"
  );

  // Log the full image URL generation logic
  if (items.length > 0 && items[0].main_image) {
    const sampleImage = items[0].main_image;
    console.log("🔗 Sample Image URL Analysis:", {
      "Original Path": sampleImage,
      "Is Full URL": sampleImage.startsWith("http"),
      "Is Local Path": sampleImage.startsWith("/"),
      "Generated URL": getImageUrl(sampleImage),
    });
  }
  console.groupEnd();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center sm:p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden sm:rounded-lg bg-white shadow-xl transition-all">
          <div className="flex sm:max-h-[90vh] flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
              <button
                type="button"
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto sm:px-6 sm:py-4 py-2">
              {submitError && (
                <div className="mb-4 sm:rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {submitError}
                      </h3>
                    </div>
                  </div>
                </div>
              )}
              <p className="mb-4 px-2 sm:px-0 text-sm text-gray-600">
                Please fill in your details to complete the purchase
              </p>

              <form onSubmit={handleSubmit} className="sm:space-y-6 space-y-2">
                {/* Order Summary */}
                <div className="bg-gray-50 sm:rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Order Summary
                  </h3>
                  <div className="mt-4">
                    <div className="flow-root">
                      <ul
                        role="list"
                        className="-my-6 divide-y divide-gray-200"
                      >
                        {items.map((item) => (
                          <li key={item.id} className="flex py-6">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                              <div className="relative h-full w-full bg-gray-100 flex items-center justify-center">
                                {item.main_image ? (
                                  <img
                                    src={getImageUrl(item.main_image)}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      console.error(
                                        `❌ Failed to load image: ${target.src}`
                                      );
                                      target.style.display = "none";
                                      // Show fallback text
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const fallback =
                                          parent.querySelector(
                                            ".fallback-text"
                                          );
                                        if (fallback) {
                                          (
                                            fallback as HTMLElement
                                          ).style.display = "flex";
                                        }
                                      }
                                    }}
                                    onLoad={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      console.log(
                                        `✅ Successfully loaded image: ${target.src}`
                                      );
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="fallback-text absolute inset-0 flex items-center justify-center text-xs text-gray-400 text-center p-2"
                                  style={{
                                    display: item.main_image ? "none" : "flex",
                                  }}
                                >
                                  {/* <div className="text-center">
                                    <div className="text-2xl mb-1">📷</div>
                                    <div>No Image</div>
                                  </div> */}
                                </div>
                              </div>
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3 className="line-clamp-2">{item.name}</h3>
                                <p className="ml-4 whitespace-nowrap">
                                  ₺
                                  {(Number(item.price) * item.quantity).toFixed(
                                    2
                                  )}
                                  {item.quantity > 1 && (
                                    <span className="ml-1 text-sm text-gray-500">
                                      (₺{Number(item.price).toFixed(2)} ×{" "}
                                      {item.quantity})
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="sm:space-y-6 space-y-4 bg-white sm:p-6 p-4 sm:rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact Information
                  </h3>

                  <div className="space-y-5">
                    {/* Email */}
                    <div className="relative">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email address
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className={`block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                            errors.email
                              ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          placeholder="you@example.com"
                          aria-invalid={!!errors.email}
                          aria-describedby={
                            errors.email ? "email-error" : undefined
                          }
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p
                          className="mt-1 text-sm text-red-600"
                          id="email-error"
                        >
                          <svg
                            className="w-4 h-4 mr-1 inline"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1.5 ml-1"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className={`block w-full pl-10 pr-4 py-3 border ${
                            errors.phone ? "border-red-300" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200`}
                          placeholder="+1 (555) 123-4567"
                          aria-invalid={!!errors.phone}
                          aria-describedby={
                            errors.phone ? "phone-error" : undefined
                          }
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700 mb-1.5 ml-1"
                      >
                        <MessageSquare className="w-4 h-4 inline mr-2 -mt-1 text-gray-400" />
                        Additional Notes (Optional)
                      </label>
                      <div className="relative">
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            handleInputChange("notes", e.target.value)
                          }
                          rows={4}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Any special requirements, delivery instructions, or questions..."
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 space-y-4">
                  {total < 1000 ? (
                    <div className="text-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                      <p className="text-sm text-amber-700">
                        <span className="font-semibold">Free Delivery:</span>{" "}
                        Orders exceeding ₺1,000 qualify for free shipping.
                        <span className="font-medium">
                          {" "}
                          Add ₺{(1000 - total).toFixed(2)} worth of products to
                          your order to qualify.
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg mb-3">
                      <p className="text-sm text-green-700">
                        <span className="font-semibold">
                          Your order qualifies for free delivery.
                        </span>
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full  bg-gradient-to-r from-accent to-secondary-light text-white py-4 sm:rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Your Order...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Submit Order • ${total.toFixed(2)}</span>
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 text-center px-2">
                    <svg
                      className="w-4 h-4 inline-block mr-1 -mt-0.5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    We'll contact you within 24 hours to confirm your order and
                    arrange delivery.
                  </p>

                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Your information is secure and encrypted</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
