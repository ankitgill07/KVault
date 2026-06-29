// src/services/wishlistService.ts
//
// Wishlist Service — wraps wishlistApi with reusable business-logic helpers.
// Controllers / pages import this, not wishlistApi directly.

import { wishlistApi, type WishlistItemResponse, type WishlistResponse } from '../api/wishlistApi';

/** A flattened wishlist item with populated course data for UI use */
export interface WishlistItemUI {
  courseId: string;
  title: string;
  price: number;
  thumbnail: string;
  slug: string;
}

export interface WishlistUI {
  wishlistId: string;
  items: WishlistItemUI[];
  totalItems: number;
}

// ─── Mapper: API response → UI-friendly shape ─────────────────────────────────

const mapWishlistItemToUI = (item: WishlistItemResponse): WishlistItemUI => ({
  courseId: item.course?._id ?? item._id,
  title: item.course?.title ?? 'Unknown Course',
  price: item.course?.price ?? 0,
  thumbnail: item.course?.thumbnail ?? '',
  slug: item.course?.slug ?? '',
});

const mapWishlistResponseToUI = (res: WishlistResponse): WishlistUI => {
  const wishlist = res.data.wishlist;
  return {
    wishlistId: wishlist._id,
    items: wishlist.items.map(mapWishlistItemToUI),
    totalItems: wishlist.totalItems,
  };
};

// ─── Service ───────────────────────────────────────────────────────────────────

export const wishlistService = {
  /** Fetch the current user's wishlist and return UI-friendly data */
  getWishlist: async (): Promise<WishlistUI> => {
    const res = await wishlistApi.getWishlist();
    return mapWishlistResponseToUI(res);
  },

  /** Add a course to the wishlist */
  addToWishlist: async (courseId: string): Promise<WishlistUI> => {
    const res = await wishlistApi.addToWishlist(courseId);
    return mapWishlistResponseToUI(res);
  },

  /** Remove a course from the wishlist */
  removeFromWishlist: async (courseId: string): Promise<WishlistUI> => {
    const res = await wishlistApi.removeFromWishlist(courseId);
    return mapWishlistResponseToUI(res);
  },

  /** Check if a course is in the wishlist (client-side utility) */
  isInWishlist: (wishlist: WishlistUI, courseId: string): boolean => {
    return wishlist.items.some((item) => item.courseId === courseId);
  },
};

