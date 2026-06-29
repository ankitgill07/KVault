import mongoose, { Schema, Model } from "mongoose";
import type { IReview, ICourse } from "../interfaces/courseInterfaces.js";

const ReviewSchema = new Schema<IReview>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    // ── Rating ──────────────────────────────────────────────
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      maxlength: [200, "Title cannot exceed 200 characters"],
      default: null,
    },
    comment: {
      type: String,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
      default: null,
    },

    // ── Review Details ──────────────────────────────────────
    pros: [
      {
        type: String,
        trim: true,
        maxlength: [500, "Each pro cannot exceed 500 characters"],
      },
    ],
    cons: [
      {
        type: String,
        trim: true,
        maxlength: [500, "Each con cannot exceed 500 characters"],
      },
    ],

    // ── Engagement ──────────────────────────────────────────
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, "Helpful count cannot be negative"],
    },
    reportCount: {
      type: Number,
      default: 0,
      min: [0, "Report count cannot be negative"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ── Status ──────────────────────────────────────────────
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ── Response from Instructor ────────────────────────────
    instructorResponse: {
      type: String,
      maxlength: [2000, "Response cannot exceed 2000 characters"],
      default: null,
    },
    instructorRespondedAt: {
      type: Date,
      default: null,
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

ReviewSchema.index({ course: 1, isApproved: 1, rating: -1 });
ReviewSchema.index({ student: 1, course: 1 }, { unique: true });
ReviewSchema.index({ isFeatured: 1, isApproved: 1 });
ReviewSchema.index({ rating: -1, helpfulCount: -1 });

// ─── Pre-save Hook: Verify purchase ──────────────────────────────────────────

ReviewSchema.pre<IReview>("save", async function () {
  // Check if student is enrolled in the course
  const Enrollment = mongoose.model("Enrollment");
  const enrollment = await Enrollment.findOne({
    student: this.student,
    course: this.course,
  });

  if (enrollment) {
    this.isVerified = true;
  }
});

// ─── Post-save Hook: Update course rating ─────────────────────────────────────

ReviewSchema.post("save", async function (doc) {
  const Course = mongoose.model("Course");

  // Calculate new average rating
  const result: any = await mongoose.model("Review").aggregate([
    { $match: { course: doc.course, isApproved: true } },
    {
      $group: {
        _id: "$course",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Course.findByIdAndUpdate(doc.course, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count,
    });
  }
});

// ─── Post-remove Hook: Update course rating ───────────────────────────────────

ReviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Course = mongoose.model("Course");

    const result: any = await mongoose.model("Review").aggregate([
      { $match: { course: doc.course, isApproved: true } },
      {
        $group: {
          _id: "$course",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await Course.findByIdAndUpdate(doc.course, {
        rating: Math.round(result[0].avgRating * 10) / 10,
        reviewCount: result[0].count,
      });
    } else {
      // No reviews left, reset to 0
      await Course.findByIdAndUpdate(doc.course, {
        rating: 0,
        reviewCount: 0,
      });
    }
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

ReviewSchema.methods.getRatingStars = function (): number[] {
  const stars = [1, 2, 3, 4, 5];
  return stars.map((star) => (star <= this.rating ? 1 : 0));
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Review: Model<IReview> = mongoose.model<IReview>("Review", ReviewSchema);

export default Review;