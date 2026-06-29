import mongoose, { Schema, Model } from "mongoose";
import type { IQuiz, ILesson, ICourse, IQuestion } from "../interfaces/courseInterfaces.js";

const QuizSchema = new Schema<IQuiz>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [200, "Quiz title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: null,
    },
    instructions: {
      type: String,
      maxlength: [2000, "Instructions cannot exceed 2000 characters"],
      default: null,
    },

    // ── Quiz Settings ───────────────────────────────────────
    timeLimit: {
      type: Number,
      min: [1, "Time limit must be at least 1 minute"],
      default: null,
    },
    passingScore: {
      type: Number,
      required: [true, "Passing score is required"],
      min: [0, "Passing score cannot be less than 0"],
      max: [100, "Passing score cannot exceed 100"],
      default: 70,
    },
    maxAttempts: {
      type: Number,
      required: [true, "Max attempts is required"],
      min: [1, "Max attempts must be at least 1"],
      default: 3,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    showResultsImmediately: {
      type: Boolean,
      default: true,
    },

    // ── Questions ───────────────────────────────────────────
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    totalQuestions: {
      type: Number,
      required: [true, "Total questions is required"],
      min: [1, "Quiz must have at least 1 question"],
      default: 0,
    },
    totalPoints: {
      type: Number,
      required: [true, "Total points is required"],
      min: [1, "Total points must be at least 1"],
      default: 0,
    },

    // ── Statistics ──────────────────────────────────────────
    attemptCount: {
      type: Number,
      default: 0,
      min: [0, "Attempt count cannot be negative"],
    },
    averageScore: {
      type: Number,
      default: 0,
      min: [0, "Average score cannot be negative"],
    },
    passRate: {
      type: Number,
      default: 0,
      min: [0, "Pass rate cannot be less than 0"],
      max: [100, "Pass rate cannot exceed 100"],
    },

    isPublished: {
      type: Boolean,
      default: false,
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

QuizSchema.index({ lesson: 1 });
QuizSchema.index({ course: 1, isPublished: 1 });

// ─── Pre-save Hook: Calculate totals ──────────────────────────────────────────

QuizSchema.pre<IQuiz>("save", function () {
  // Ensure totalQuestions matches questions array length
  this.totalQuestions = this.questions.length;
});

// ─── Post-save Hook: Update lesson quiz reference ──────────────────────────────

QuizSchema.post("save", async function (doc) {
  if (doc.isNew) {
    await mongoose.model("Lesson").findByIdAndUpdate(doc.lesson, {
      quiz: doc._id,
    });
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

QuizSchema.methods.getTimeLimitFormatted = function (): string {
  if (!this.timeLimit) return "No limit";

  const hours = Math.floor(this.timeLimit / 60);
  const minutes = this.timeLimit % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

QuizSchema.methods.getPointsPerQuestion = function (): number {
  return this.totalQuestions > 0
    ? Math.round(this.totalPoints / this.totalQuestions)
    : 0;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Quiz: Model<IQuiz> = mongoose.model<IQuiz>("Quiz", QuizSchema);

export default Quiz;