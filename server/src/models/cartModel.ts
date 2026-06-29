// src/models/cartModel.ts
//
// One Cart document per user. Items reference the Course collection so the
// cart stays in sync with course data (title, price, thumbnail, …).

import mongoose, { Schema, Model } from "mongoose";
import type { ICart } from "../interfaces/cartWishlistInterfaces.js";

// ─── Cart Item Sub-schema ─────────────────────────────────────────────────────

const CartItemSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    priceAtAdd: {
      type: Number,
      required: [true, "Price snapshot is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

// ─── Cart Schema ──────────────────────────────────────────────────────────────

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true, // one cart per user
    },
    items: {
      type: [CartItemSchema],
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


CartSchema.index({ "items.course": 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

CartSchema.virtual("totalItems").get(function (this: ICart) {
  return this.items.length;
});

CartSchema.virtual("subtotal").get(function (this: ICart) {
  return this.items.reduce((sum, item) => sum + (item.priceAtAdd || 0), 0);
});

// ─── Model ────────────────────────────────────────────────────────────────────

const Cart: Model<ICart> = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
