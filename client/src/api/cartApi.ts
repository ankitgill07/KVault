// src/api/cartApi.ts
//
// Cart API — handles all HTTP communication with the server cart endpoints.
// This file is the single source of truth for cart API calls.

import { axiosInstance } from "./axoisInstance";

export interface CartItemResponse {
  _id: string;
  course: {
    _id: string;
    title: string;
    price: number;
    discountPrice?: number;
    thumbnailUrl?: string;
    slug: string;
  };
  priceAtAdd: number;
  addedAt: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    cart: {
      _id: string;
      user: string;
      items: CartItemResponse[];
      totalItems: number;
      subtotal: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
    };
    cart: {
      _id: string;
      user: string;
      items: CartItemResponse[];
      totalItems: number;
      subtotal: number;
    };
  };
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    orderId: string;
    enrolledCourses: string[];
  };
}

export const cartApi = {
  /** GET /api/cart — Fetch the current user's cart */
  getCart: async (): Promise<CartResponse> => {
    const response = await axiosInstance.get("/cart");
    return response.data;
  },

  /** POST /api/cart/items — Add a course to the cart */
  addToCart: async (courseId: string, priceAtAdd?: number): Promise<CartResponse> => {
    const response = await axiosInstance.post("/cart/items", { courseId, priceAtAdd });
    return response.data;
  },

  /** DELETE /api/cart/items/:courseId — Remove a course from the cart */
  removeFromCart: async (courseId: string): Promise<CartResponse> => {
    const response = await axiosInstance.delete(`/cart/items/${courseId}`);
    return response.data;
  },

  /** DELETE /api/cart — Clear the entire cart */
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete("/cart");
    return response.data;
  },

  /** POST /api/payment/create-order — Create or reuse payment order for cart */
  checkout: async (): Promise<CheckoutResponse> => {
    const response = await axiosInstance.post("/payment/create-order");
    return response.data;
  },
};

export const paymentApi = {
  /** POST /api/payment/verify — Verify payment and enroll courses */
  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<PaymentVerifyResponse> => {
    const response = await axiosInstance.post("/payment/verify", paymentData);
    return response.data;
  },
};
