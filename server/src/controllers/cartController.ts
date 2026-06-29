// src/controllers/cart.controller.ts
//
// Thin HTTP layer — every method does exactly three things:
//   1. Pull validated data from req.body / req.params
//   2. Call the matching cart service function
//   3. Send a success response  (or let the error flow to errorHandler)
//
// No business logic lives here.

import { type Request, type Response, type NextFunction } from "express";
import {
  getCartByUserId,
  addToCart as addToCartService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  checkout as checkoutService,
} from "../services/cartService.js";
import { sendSuccess, sendError } from "../utils/responseUtil.js";
import { type AuthenticatedRequest } from "../types/type.js";
import { validateBody } from "../middleware/vaildateMiddleware.js";
import { AddToCartSchema } from "../schemas/cartWishlistSchemas.js";
import type { RemoveParams } from "../interfaces/cartWishlistInterfaces.js";


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

    const result = await checkoutService(userId);
    sendSuccess(res, "Checkout successful! Courses enrolled.", result);
  } catch (error: any) {
    console.error("[checkout]", error);
    sendError(res, error.message || "Checkout failed", error.statusCode || 400);
  }
};
