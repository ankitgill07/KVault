import mongoose, { Schema, Model } from "mongoose";
import type { ICategory } from "../interfaces/courseInterfaces.js";

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    courseCount: {
      type: Number,
      default: 0,
      min: [0, "Course count cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        if (ret) {
          delete (ret as any).__v;
        }
        return ret;
      },
    },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────


CategorySchema.index({ parentCategory: 1, isActive: 1 });
CategorySchema.index({ isActive: 1, courseCount: -1 });

// ─── Pre-save Hook: Auto-generate slug ─────────────────────────────────────────

CategorySchema.pre("save", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});
// ─── Instance Methods ─────────────────────────────────────────────────────────

CategorySchema.methods.getFullPath = function (): string {
  return this.name;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  CategorySchema
);

export default Category;