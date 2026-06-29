import mongoose, { Schema, Model } from "mongoose";
import type { IAnswer, IQuizAttempt, IQuestion, IOption } from "../interfaces/courseInterfaces.js";

const AnswerSchema = new Schema<IAnswer>(
  {
    quizAttempt: {
      type: Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: [true, "Quiz attempt is required"],
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question is required"],
    },

    // ── Answer Content ──────────────────────────────────────
    selectedOption: {
      type: Schema.Types.ObjectId,
      ref: "Option",
      default: null,
    },
    selectedOptions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    textAnswer: {
      type: String,
      maxlength: [2000, "Text answer cannot exceed 2000 characters"],
      default: null,
    },

    // ── Grading ─────────────────────────────────────────────
    isCorrect: {
      type: Boolean,
      required: [true, "isCorrect is required"],
    },
    pointsEarned: {
      type: Number,
      required: [true, "Points earned is required"],
      min: [0, "Points earned cannot be negative"],
      default: 0,
    },
    feedback: {
      type: String,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"],
      default: null,
    },

    answeredAt: {
      type: Date,
      required: [true, "Answered at is required"],
      default: Date.now,
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

AnswerSchema.index({ quizAttempt: 1, question: 1 }, { unique: true });

// ─── Instance Methods ─────────────────────────────────────────────────────────

AnswerSchema.methods.getSelectedOptionText = function (): string | null {
  if (!this.selectedOption) return null;
  // This would need to be populated to get the actual text
  return this.selectedOption.toString();
};

AnswerSchema.methods.getSelectedOptionsText = function (): string[] {
  if (!this.selectedOptions || this.selectedOptions.length === 0) {
    return [];
  }
  // This would need to be populated to get the actual text
  return this.selectedOptions.map((opt: any) => opt.toString());
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Answer: Model<IAnswer> = mongoose.model<IAnswer>("Answer", AnswerSchema);

export default Answer;