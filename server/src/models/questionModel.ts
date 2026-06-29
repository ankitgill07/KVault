import mongoose, { Schema, Model } from "mongoose";
import type { IQuestion, IQuiz, IOption } from "../interfaces/courseInterfaces.js";
import { QuestionType } from "../interfaces/courseInterfaces.js";

const QuestionSchema = new Schema<IQuestion>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz is required"],
    },

    // ── Question Content ────────────────────────────────────
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      maxlength: [1000, "Question text cannot exceed 1000 characters"],
    },
    questionType: {
      type: String,
      enum: Object.values(QuestionType),
      required: [true, "Question type is required"],
    },
    points: {
      type: Number,
      required: [true, "Points is required"],
      min: [1, "Points must be at least 1"],
      default: 1,
    },
    order: {
      type: Number,
      required: [true, "Question order is required"],
      min: [1, "Order must be at least 1"],
    },

    // ── Media ───────────────────────────────────────────────
    image: {
      type: String,
      default: null,
    },
    audio: {
      type: String,
      default: null,
    },

    // ── Options (for MCQ) ───────────────────────────────────
    options: [
      {
        type: Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    correctAnswer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    explanation: {
      type: String,
      maxlength: [1000, "Explanation cannot exceed 1000 characters"],
      default: null,
    },

    // ── Settings ────────────────────────────────────────────
    isRequired: {
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

QuestionSchema.index({ quiz: 1, order: 1 });

// ─── Pre-save Hook: Ensure order is positive ──────────────────────────────────

QuestionSchema.pre<IQuestion>("save", function () {
  if (this.order < 1) {
    this.order = 1;
  }
});

// ─── Post-remove Hook: Update quiz question count ─────────────────────────────

QuestionSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("Quiz").findByIdAndUpdate(doc.quiz, {
      $inc: { totalQuestions: -1 },
    });
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

QuestionSchema.methods.getCorrectOption = function (): IOption | null {
  if (this.options.length === 0) return null;
  
  // This would need to be populated, returning placeholder
  return null;
};

QuestionSchema.methods.isCorrectAnswer = function (selectedOptionId: string): boolean {
  if (Array.isArray(this.correctAnswer)) {
    return this.correctAnswer.includes(selectedOptionId);
  }
  return this.correctAnswer === selectedOptionId;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Question: Model<IQuestion> = mongoose.model<IQuestion>(
  "Question",
  QuestionSchema
);

export default Question;