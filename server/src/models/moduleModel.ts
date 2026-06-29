import mongoose, { Schema, Model } from "mongoose";
import type { IModule, ICourse } from "../interfaces/courseInterfaces.js";

const ModuleSchema = new Schema<IModule>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
      maxlength: [200, "Module title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: null,
    },
    order: {
      type: Number,
      required: [true, "Module order is required"],
      min: [1, "Order must be at least 1"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    totalLessons: {
      type: Number,
      default: 0,
      min: [0, "Total lessons cannot be negative"],
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

ModuleSchema.index({ course: 1, order: 1 });
ModuleSchema.index({ course: 1, isPublished: 1 });

// ─── Pre-save Hook: Auto-update course totals ──────────────────────────────────

ModuleSchema.pre<IModule>("save", function () {
  // Ensure order is positive
  if (this.order < 1) {
    this.order = 1;
  }
});

// ─── Post-save Hook: Update course module count ────────────────────────────────

ModuleSchema.post("save", async function (doc) {
  await mongoose.model("Course").findByIdAndUpdate(doc.course, {
    $inc: { totalModules: doc.isNew ? 1 : 0 },
  });
});

// ─── Post-remove Hook: Decrement course module count ──────────────────────────

ModuleSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Course").findByIdAndUpdate(doc.course, {
      $inc: { totalModules: -1 },
    });
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

ModuleSchema.methods.getDurationFormatted = function (): string {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Module: Model<IModule> = mongoose.model<IModule>("Module", ModuleSchema);

export default Module;