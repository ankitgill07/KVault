// src/models/wishlistModel.ts
//
// One Wishlist document per user. Items reference the Course collection so the
// wishlist stays in sync with course data (title, price, thumbnail, …).

import mongoose, { Schema, Model } from 'mongoose';
import type { IWishlist } from '../interfaces/cartWishlistInterfaces.js';

// ─── Wishlist Item Sub-schema ────────────────────────────────────────────────

const WishlistItemSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

// ─── Wishlist Schema ─────────────────────────────────────────────────────────

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true, // one wishlist per user
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        if (ret) delete (ret as any).__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────


WishlistSchema.index({ 'items.course': 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

WishlistSchema.virtual('totalItems').get(function (this: IWishlist) {
  return this.items.length;
});

// ─── Model ────────────────────────────────────────────────────────────────────

const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>(
  'Wishlist',
  WishlistSchema
);

export default Wishlist;
