// src/services/cartService.ts
//
// Cart Service — wraps cartApi with reusable business-logic helpers.
// Controllers / pages import this, not cartApi directly.

import { cartApi, type CartItemResponse, type CartResponse, type CheckoutResponse } from '../api/cartApi';

/** A flattened cart item with populated course data for UI use */
export interface CartItemUI {
  courseId: string;
  title: string;
  price: number;          // effective price (discountPrice or price)
  originalPrice: number;  // full MRP
  discountPrice?: number; // sale price if set
  thumbnailUrl: string;
  slug: string;
}

export interface CartUI {
  cartId: string;
  items: CartItemUI[];
  totalItems: number;
  subtotal: number;
}

// ─── Mapper: API response → UI-friendly shape ─────────────────────────────────

const mapCartItemToUI = (item: CartItemResponse): CartItemUI => ({
  courseId: item.course?._id ?? item._id,
  title: item.course?.title ?? 'Unknown Course',
  price: item.course?.discountPrice ?? item.priceAtAdd ?? item.course?.price ?? 0,
  originalPrice: item.course?.price ?? item.priceAtAdd ?? 0,
  discountPrice: item.course?.discountPrice,
  thumbnailUrl: item.course?.thumbnailUrl ?? '',
  slug: item.course?.slug ?? '',
});

const mapCartResponseToUI = (res: CartResponse): CartUI => {
  const cart = res.data.cart;
  return {
    cartId: cart._id,
    items: cart.items.map(mapCartItemToUI),
    totalItems: cart.totalItems,
    subtotal: cart.subtotal,
  };
};

// ─── Service ───────────────────────────────────────────────────────────────────

export const cartService = {
  /** Fetch the current user's cart and return UI-friendly data */
  getCart: async (): Promise<CartUI> => {
    const res = await cartApi.getCart();
    return mapCartResponseToUI(res);
  },

  /** Add a course to the cart */
  addToCart: async (courseId: string, priceAtAdd?: number): Promise<CartUI> => {
    const res = await cartApi.addToCart(courseId, priceAtAdd);
    return mapCartResponseToUI(res);
  },

  /** Remove a course from the cart */
  removeFromCart: async (courseId: string): Promise<CartUI> => {
    const res = await cartApi.removeFromCart(courseId);
    return mapCartResponseToUI(res);
  },

  /** Clear the entire cart */
  clearCart: async (): Promise<void> => {
    await cartApi.clearCart();
  },

  /** Checkout — enroll in all cart courses */
  checkout: async (): Promise<CheckoutResponse['data']> => {
    const res = await cartApi.checkout();
    return res.data;
  },

  /** Check if a course is in the cart (client-side utility) */
  isInCart: (cart: CartUI, courseId: string): boolean => {
    return cart.items.some((item) => item.courseId === courseId);
  },
};
