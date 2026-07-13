// src/api/wishlistApi.ts
//
// Wishlist API — handles all HTTP communication with the server wishlist endpoints.
// This file is the single source of truth for wishlist API calls.

import { axiosInstance } from "./axoisInstance";

export interface WishlistItemResponse {
  _id: string;
  course: {
    _id: string;
    title: string;
    price: number;
    thumbnailUrl?: string;
    slug: string;
  };
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    wishlist: {
      _id: string;
      user: string;
      items: WishlistItemResponse[];
      totalItems: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export const wishlistApi = {
  /** GET /api/wishlist — Fetch the current user's wishlist */
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await axiosInstance.get("/wishlist");
    return response.data;
  },

  /** POST /api/wishlist/items — Add a course to the wishlist */
  addToWishlist: async (courseId: string): Promise<WishlistResponse> => {
    const response = await axiosInstance.post("/wishlist/items", { courseId });
    return response.data;
  },

  /** DELETE /api/wishlist/items/:courseId — Remove a course from the wishlist */
  removeFromWishlist: async (courseId: string): Promise<WishlistResponse> => {
    const response = await axiosInstance.delete(`/wishlist/items/${courseId}`);
    return response.data;
  },
};
