// src/services/wishlist.service.ts
//
// Pure business logic for the Wishlist collection.
// Controllers call these functions — they never touch Express (Request/Response).

import mongoose from 'mongoose';
import Wishlist from '../models/wishlistModel.js';
import Course from '../models/courseModel.js';
import { AppError } from '../utils/appError.js';
import type { IWishlist } from '../interfaces/cartWishlistInterfaces.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// ─── 1. Get Wishlist ──────────────────────────────────────────────────────────

export const getWishlistByUserId = async (
  userId: string
): Promise<IWishlist> => {
  let wishlist = await Wishlist.findOne({ user: toObjectId(userId) }).populate(
    'items.course',
    'title price thumbnail slug'
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: toObjectId(userId), items: [] });
  }

  return wishlist;
};

// ─── 2. Add to Wishlist ───────────────────────────────────────────────────────

export const addToWishlist = async (
  userId: string,
  courseId: string
): Promise<IWishlist> => {
  const objectId = toObjectId(courseId);

  const course = await Course.findById(objectId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  let wishlist = await Wishlist.findOne({ user: toObjectId(userId) });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: toObjectId(userId),
      items: [{ course: objectId }],
    });
    return wishlist;
  }

  const exists = wishlist.items.some(
    (item) => item.course.toString() === courseId
  );

  if (exists) {
    throw new AppError('Course is already in your wishlist', 400);
  }

  wishlist.items.push({ course: objectId, addedAt: new Date() });
  await wishlist.save();

  return wishlist;
};

// ─── 3. Remove from Wishlist ──────────────────────────────────────────────────

export const removeFromWishlist = async (
  userId: string,
  courseId: string
): Promise<IWishlist | null> => {
  const wishlist = await Wishlist.findOne({ user: toObjectId(userId) });

  if (!wishlist) return null;

  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(
    (item) => item.course.toString() !== courseId
  );

  if (wishlist.items.length === initialLength) {
    return null; // item was not in wishlist
  }

  await wishlist.save();
  return wishlist;
};
