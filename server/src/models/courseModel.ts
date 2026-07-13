import mongoose, { Schema, Model } from "mongoose";
import type { ICourse, ICategory } from "../interfaces/courseInterfaces.js";
import {
  CourseLevel,
  CourseStatus,
} from "../interfaces/courseInterfaces.js";

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Course title cannot exceed 200 characters"],
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
    subtitle: {
      type: String,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
      default: null,
    },
    description: {
      type: String,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
      default: null,
    },

    // ── Categorization ─────────────────────────────────────
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    level: {
      type: String,
      enum: Object.values(CourseLevel),
      required: [true, "Course level is required"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      default: "English",
    },

    // ── Media ───────────────────────────────────────────────
    thumbnailUrl: {
      type: String,
      default: null,
    },
    thumbnailKey: {
      type: String,
      default: null,
    },

    // ── Instructors ─────────────────────────────────────────
    primaryInstructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Primary instructor is required"],
    },

    // ── Course Details ──────────────────────────────────────
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    targetAudience: [
      {
        type: String,
        trim: true,
      },
    ],
    duration: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
      min: [0, "Total lessons cannot be negative"],
    },
    totalModules: {
      type: Number,
      default: 0,
      min: [0, "Total modules cannot be negative"],
    },

    // ── Pricing ─────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (this: ICourse, value: number) {
          return !value || value < this.price;
        },
        message: "Discount price must be less than regular price",
      },
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "INR",
      maxlength: [3, "Currency code must be 3 characters"],
    },
    isFree: {
      type: Boolean,
      default: false,
    },

    // ── Status & Visibility ─────────────────────────────────
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },

    // ── Statistics ──────────────────────────────────────────
    enrollmentCount: {
      type: Number,
      default: 0,
      min: [0, "Enrollment count cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"],
    },

    // ── SEO ─────────────────────────────────────────────────

    metaKeywords: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Additional Info ─────────────────────────────────────
    certificateEnabled: {
      type: Boolean,
      default: true,
    },
    lifetimeAccess: {
      type: Boolean,
      default: true,
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

CourseSchema.index({ category: 1, isPublished: 1, status: 1 });
CourseSchema.index({ primaryInstructor: 1, isPublished: 1 });
CourseSchema.index({ level: 1, isPublished: 1 });
CourseSchema.index({ rating: -1, enrollmentCount: -1 });
CourseSchema.index({ featured: 1, isPublished: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ createdAt: -1 });
CourseSchema.index({ title: "text", description: "text", tags: "text" });

// ─── Pre-save Hook: Auto-generate slug ─────────────────────────────────────────

CourseSchema.pre<ICourse>("save", function () {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100);
  }

  // Set publishedAt when course is first published
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// ─── Pre-update Hook ──────────────────────────────────────────────────────────

CourseSchema.pre("updateOne", function () {
  const update = this.getUpdate() as any;

  if (update.isPublished && !update.publishedAt) {
    update.publishedAt = new Date();
  }
});
// ─── Instance Methods ─────────────────────────────────────────────────────────

CourseSchema.methods.getEnrollmentRate = function (): number {
  return this.enrollmentCount > 0
    ? Math.round((this.enrollmentCount / this.viewCount) * 100)
    : 0;
};

CourseSchema.methods.getDiscountedPrice = function (): number {
  return this.discountPrice || this.price;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Course: Model<ICourse> = mongoose.model<ICourse>("Course", CourseSchema);

export default Course;