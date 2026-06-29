import mongoose, { Schema, Model } from "mongoose";
import type { IQuizAttempt, IQuiz, ICourse, IAnswer } from "../interfaces/courseInterfaces.js";

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz is required"],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },

    // ── Attempt Details ─────────────────────────────────────
    attemptNumber: {
      type: Number,
      required: [true, "Attempt number is required"],
      min: [1, "Attempt number must be at least 1"],
    },
    startedAt: {
      type: Date,
      required: [true, "Start time is required"],
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: [0, "Time spent cannot be negative"],
    },

    // ── Answers ─────────────────────────────────────────────
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],

    // ── Results ─────────────────────────────────────────────
    score: {
      type: Number,
      default: 0,
      min: [0, "Score cannot be negative"],
    },
    totalPoints: {
      type: Number,
      required: [true, "Total points is required"],
      min: [1, "Total points must be at least 1"],
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, "Percentage cannot be less than 0"],
      max: [100, "Percentage cannot exceed 100"],
    },
    isPassed: {
      type: Boolean,
      default: false,
    },

    // ── Review ──────────────────────────────────────────────
    reviewedAnswers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
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

QuizAttemptSchema.index({ quiz: 1, student: 1, attemptNumber: 1 });
QuizAttemptSchema.index({ student: 1, completedAt: -1 });
QuizAttemptSchema.index({ quiz: 1, isPassed: 1 });

// ─── Pre-save Hook: Calculate results ─────────────────────────────────────────

QuizAttemptSchema.pre<IQuizAttempt>("save", function () {
  // Auto-set completedAt when attempt is completed
  if (this.isPassed && !this.completedAt) {
    this.completedAt = new Date();
  }
});

// ─── Post-save Hook: Update quiz statistics ───────────────────────────────────

QuizAttemptSchema.post("save", async function (doc) {
  const Quiz = mongoose.model("Quiz");

  // Update attempt count
  await Quiz.findByIdAndUpdate(doc.quiz, {
    $inc: { attemptCount: doc.isNew ? 1 : 0 },
  });

  // Recalculate average score and pass rate
  if (doc.completedAt) {
    const result: any = await mongoose.model("QuizAttempt").aggregate([
      { $match: { quiz: doc.quiz, completedAt: { $ne: null } } },
      {
        $group: {
          _id: "$quiz",
          avgScore: { $avg: "$percentage" },
          passRate: {
            $avg: {
              $cond: [{ $gte: ["$percentage", 70] }, 1, 0],
            },
          },
        },
      },
    ]);

    if (result.length > 0) {
      await Quiz.findByIdAndUpdate(doc.quiz, {
        averageScore: Math.round(result[0].avgScore * 10) / 10,
        passRate: Math.round(result[0].passRate * 100),
      });
    }
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

QuizAttemptSchema.methods.getTimeSpentFormatted = function (): string {
  const hours = Math.floor(this.timeSpent / 3600);
  const minutes = Math.floor((this.timeSpent % 3600) / 60);
  const seconds = this.timeSpent % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

QuizAttemptSchema.methods.getGrade = function (): string {
  if (this.percentage >= 90) return "A";
  if (this.percentage >= 80) return "B";
  if (this.percentage >= 70) return "C";
  if (this.percentage >= 60) return "D";
  return "F";
};

// ─── Model ────────────────────────────────────────────────────────────────────

const QuizAttempt: Model<IQuizAttempt> = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  QuizAttemptSchema
);

export default QuizAttempt;