// src/interfaces/cartWishlistInterfaces.ts
//
// Type definitions for the Cart & Wishlist models.
// These schemas are *normalized*: instead of storing plain course-id strings
// on the User document, each user owns exactly one Cart document and one
// Wishlist document, each holding references back to the User and to Courses.

import mongoose, { Document } from "mongoose";
import type { IUser } from "./interfaces.js";
import type { ICourse } from "./courseInterfaces.js";

// ─── Cart Item (sub-document) ────────────────────────────────────────────────

export interface ICartItem {
  course: mongoose.Types.ObjectId | ICourse;
  // Snapshot of the price at the moment the course was added to the cart.
  priceAtAdd: number;
  addedAt: Date;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface ICart extends Document {
  user: mongoose.Types.ObjectId | IUser;
  items: ICartItem[];

  // ── Derived / virtuals ──────────────────────────────
  totalItems: number;
  subtotal: number;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Wishlist Item (sub-document) ────────────────────────────────────────────

export interface IWishlistItem {
  course: mongoose.Types.ObjectId | ICourse;
  addedAt: Date;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId | IUser;
  items: IWishlistItem[];

  totalItems: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface RemoveParams {
  courseId: string;
}