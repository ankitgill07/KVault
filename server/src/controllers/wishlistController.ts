// src/controllers/wishlist.controller.ts
//
// Thin HTTP layer — every method does exactly three things:
//   1. Pull validated data from req.body / req.params
//   2. Call the matching wishlist service function
//   3. Send a success response  (or let the error flow to errorHandler)
//
// No business logic lives here.

import { type Request, type Response } from 'express';
import {
  getWishlistByUserId,
  addToWishlist as addToWishlistService,
  removeFromWishlist as removeFromWishlistService,
} from '../services/wishlistService.js';
import { sendSuccess, sendError } from '../utils/responseUtil.js';
import { type AuthenticatedRequest } from '../types/type.js';
import { AddToWishlistSchema } from '../schemas/cartWishlistSchemas.js';
import type { RemoveParams } from '../interfaces/cartWishlistInterfaces.js';

// ─── GET /api/wishlist ────────────────────────────────────────────────────────

export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const wishlist = await getWishlistByUserId(userId);
    sendSuccess(res, 'Wishlist fetched successfully', { wishlist });
  } catch (error) {
    console.error('[getWishlist]', error);
    sendError(res, 'Failed to fetch wishlist', 500);
  }
};

// ─── POST /api/wishlist/items ─────────────────────────────────────────────────

export const addToWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const { courseId } = req.body as { courseId: string };
    const wishlist = await addToWishlistService(userId, courseId);
    sendSuccess(res, 'Course added to wishlist', { wishlist });
  } catch (error: any) {
    console.error('[addToWishlist]', error);
    sendError(res, error.message || 'Failed to add to wishlist', error.statusCode || 400);
  }
};

// ─── DELETE /api/wishlist/items/:courseId ────────────────────────────────────

export const removeFromWishlist = async (
  req: AuthenticatedRequest & Request<RemoveParams>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const wishlist = await removeFromWishlistService(userId, courseId);
    if (!wishlist) {
      sendError(res, 'Course not found in wishlist', 404);
      return;
    }

    sendSuccess(res, 'Course removed from wishlist', { wishlist });
  } catch (error) {
    console.error('[removeFromWishlist]', error);
    sendError(res, 'Failed to remove from wishlist', 500);
  }
};
