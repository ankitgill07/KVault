import mongoose, { Schema, Model } from "mongoose";
import type { IOption, IQuestion } from "../interfaces/courseInterfaces.js";

const OptionSchema = new Schema<IOption>(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question is required"],
    },
    optionText: {
      type: String,
      required: [true, "Option text is required"],
      trim: true,
      maxlength: [500, "Option text cannot exceed 500 characters"],
    },
    isCorrect: {
      type: Boolean,
      required: [true, "isCorrect is required"],
      default: false,
    },
    order: {
      type: Number,
      required: [true, "Option order is required"],
      min: [1, "Order must be at least 1"],
    },
    explanation: {
      type: String,
      maxlength: [500, "Explanation cannot exceed 500 characters"],
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

OptionSchema.index({ question: 1, order: 1 });

// ─── Pre-save Hook: Ensure order is positive ──────────────────────────────────

OptionSchema.pre<IOption>("save", function () {
  if (this.order < 1) {
    this.order = 1;
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

OptionSchema.methods.getOptionLabel = function (): string {
  // Convert order number to letter (1 -> A, 2 -> B, etc.)
  return String.fromCharCode(64 + this.order);
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Option: Model<IOption> = mongoose.model<IOption>("Option", OptionSchema);

export default Option;