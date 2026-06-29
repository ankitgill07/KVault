import mongoose, { Schema, Model } from "mongoose";
import type { IEnrollment, ICourse, ILesson, IModule } from "../interfaces/courseInterfaces.js";
import { EnrollmentStatus } from "../interfaces/courseInterfaces.js";

const EnrollmentSchema = new Schema<IEnrollment>(
  {
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

    // ── Progress Tracking ───────────────────────────────────
    progress: {
      type: Number,
      required: [true, "Progress is required"],
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot exceed 100"],
      default: 0,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    completedModules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
    currentLesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
    currentModule: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },

    // ── Time Tracking ───────────────────────────────────────
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: [0, "Total time spent cannot be negative"],
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // ── Status ──────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // ── Certificate ─────────────────────────────────────────
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: null,
    },
    certificateIssuedAt: {
      type: Date,
      default: null,
    },

    // ── Payment Info ────────────────────────────────────────
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0, "Amount paid cannot be negative"],
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
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

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ course: 1, status: 1 });
EnrollmentSchema.index({ student: 1, status: 1 });
EnrollmentSchema.index({ isCompleted: 1, completedAt: -1 });

// ─── Pre-save Hook: Update completion status ──────────────────────────────────

EnrollmentSchema.pre<IEnrollment>("save", function () {
  // Auto-set isCompleted based on progress
  if (this.progress === 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.status = EnrollmentStatus.COMPLETED;
    this.completedAt = new Date();
  }

  // Update last accessed time
  this.lastAccessedAt = new Date();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

EnrollmentSchema.methods.getTimeSpentFormatted = function (): string {
  const hours = Math.floor(this.totalTimeSpent / 60);
  const minutes = this.totalTimeSpent % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

EnrollmentSchema.methods.getCompletionPercentage = function (): number {
  return this.progress;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Enrollment: Model<IEnrollment> = mongoose.model<IEnrollment>(
  "Enrollment",
  EnrollmentSchema
);

export default Enrollment;