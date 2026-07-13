import { type Request, type Response, type NextFunction } from "express";
import {
  getCartByUserId,
  addToCart as addToCartService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
} from "../services/cartService.js";
import { createPaymentOrder, getCartTotalInPaise, generateReceiptId } from "../services/paymentService.js";
import { sendSuccess, sendError } from "../utils/responseUtil.js";
import { type AuthenticatedRequest } from "../types/type.js";
import type { RemoveParams } from "../interfaces/cartWishlistInterfaces.js";
import Cart from "../models/cartModel.js";
import mongoose from "mongoose";


export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const cart = await getCartByUserId(userId);
    sendSuccess(res, "Cart fetched successfully", { cart });
  } catch (error) {
    console.error("[getCart]", error);
    sendError(res, "Failed to fetch cart", 500);
  }
};

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const input = req.body as { courseId: string; priceAtAdd?: number };
    const cart = await addToCartService(
      userId,
      input.courseId,
      input.priceAtAdd,
    );
    sendSuccess(res, "Course added to cart", { cart });
  } catch (error: any) {
    console.error("[addToCart]", error);
    sendError(
      res,
      error.message || "Failed to add to cart",
      error.statusCode || 400,
    );
  }
};

// ─── DELETE /api/cart/items/:courseId ────────────────────────────────────────

export const removeFromCart = async (
  req: AuthenticatedRequest & Request<RemoveParams>,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const cart = await removeFromCartService(userId, courseId);
    if (!cart) {
      sendError(res, "Course not found in cart", 404);
      return;
    }

    sendSuccess(res, "Course removed from cart", { cart });
  } catch (error) {
    console.error("[removeFromCart]", error);
    sendError(res, "Failed to remove from cart", 500);
  }
};

// ─── POST /api/cart/checkout ──────────────────────────────────────────────────

export const checkout = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    // Calculate amount from discount prices (INR)
    const cartWithPrices = await Cart.findOne({ user: new mongoose.Types.ObjectId(userId) })
      .populate('items.course', 'title price discountPrice thumbnailUrl slug');

    if (!cartWithPrices || cartWithPrices.items.length === 0) {
      sendError(res, "Your cart is empty", 400);
      return;
    }

    const amountInPaise = cartWithPrices.items.reduce((sum: number, item: any) => {
      const course = item.course as any;
      const effectivePrice = course?.discountPrice ?? course?.price ?? item.priceAtAdd ?? 0;
      return sum + Math.round(effectivePrice * 100);
    }, 0);
    
    if (amountInPaise <= 0) {
      sendError(res, "Invalid cart amount", 400);
      return;
    }

    // Generate receipt ID
    const receiptId = generateReceiptId(`cart_${userId}`);

    // Extract course IDs
    const courseIds = cartWithPrices.items
      .map((item) => (item.course as any)?._id?.toString() || item.course.toString())
      .filter(Boolean);

    // Create payment order
    const order = await createPaymentOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId,
        cartId: cartWithPrices._id.toString(),
        courseIds,
      },
    });

    sendSuccess(res, "Payment order created. Please complete payment.", { 
      order,
      cart: cartWithPrices 
    });
  } catch (error: any) {
    console.error("[checkout]", error);
    sendError(res, error.message || "Checkout failed", error.statusCode || 400);
  }
};
