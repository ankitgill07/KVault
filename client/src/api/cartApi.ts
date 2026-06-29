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
    thumbnail: string;
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
    enrolledCourses: string[];
    courseProgress: Record<string, { progress: number; lastAccessed: string; completedLessons: string[] }>;
    cart: null;
  };
}

export const cartApi = {
  /** GET /api/cart — Fetch the current user's cart */
  getCart: async (): Promise<CartResponse> => {
    const response = await axiosInstance.get("/api/cart");
    return response.data;
  },

  /** POST /api/cart/items — Add a course to the cart */
  addToCart: async (courseId: string, priceAtAdd?: number): Promise<CartResponse> => {
    const response = await axiosInstance.post("/api/cart/items", { courseId, priceAtAdd });
    return response.data;
  },

  /** DELETE /api/cart/items/:courseId — Remove a course from the cart */
  removeFromCart: async (courseId: string): Promise<CartResponse> => {
    const response = await axiosInstance.delete(`/api/cart/items/${courseId}`);
    return response.data;
  },

  /** DELETE /api/cart — Clear the entire cart */
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete("/api/cart");
    return response.data;
  },

  /** POST /api/cart/checkout — Checkout and enroll in all cart courses */
  checkout: async (): Promise<CheckoutResponse> => {
    const response = await axiosInstance.post("/api/cart/checkout");
    return response.data;
  },
};
