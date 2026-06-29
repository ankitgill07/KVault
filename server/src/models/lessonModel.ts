import mongoose, { Schema, Model } from "mongoose";
import type { ILesson, IModule, ICourse, IResource, IQuiz } from "../interfaces/courseInterfaces.js";
import { LessonContentType, VideoProvider } from "../interfaces/courseInterfaces.js";

const LessonSchema = new Schema<ILesson>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: [true, "Module is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      maxlength: [200, "Lesson title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: null,
    },
    order: {
      type: Number,
      required: [true, "Lesson order is required"],
      min: [1, "Order must be at least 1"],
    },

    // ── Content Type ────────────────────────────────────────
    contentType: {
      type: String,
      enum: Object.values(LessonContentType),
      required: [true, "Content type is required"],
    },

    // ── Video Content ───────────────────────────────────────
    videoUrl: {
      type: String,
      default: null,
    },
    videoDuration: {
      type: Number,
      min: [0, "Video duration cannot be negative"],
      default: 0,
    },
    videoProvider: {
      type: String,
      enum: Object.values(VideoProvider),
      default: null,
    },

    // ── Text Content ────────────────────────────────────────
    textContent: {
      type: String,
      default: null,
    },
    markdownContent: {
      type: String,
      default: null,
    },

    // ── Resource Files ──────────────────────────────────────
    resources: [
      {
        type: Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],

    // ── Quiz/Assessment ─────────────────────────────────────
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },

    // ── Lesson Settings ─────────────────────────────────────
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
    isPreview: {
      type: Boolean,
      default: false,
    },
    canDownload: {
      type: Boolean,
      default: false,
    },

    // ── Statistics ──────────────────────────────────────────
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"],
    },
    completionCount: {
      type: Number,
      default: 0,
      min: [0, "Completion count cannot be negative"],
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

LessonSchema.index({ module: 1, order: 1 });
LessonSchema.index({ course: 1, isPublished: 1 });
LessonSchema.index({ module: 1, isPublished: 1 });

// ─── Pre-save Hook: Ensure order is positive ──────────────────────────────────

LessonSchema.pre<ILesson>("save", function () {
  if (this.order < 1) {
    this.order = 1;
  }
});

// ─── Post-save Hook: Update module and course lesson counts ────────────────────

LessonSchema.post("save", async function (doc) {
  const Module = mongoose.model("Module");
  const Course = mongoose.model("Course");

  // Update module lesson count
  await Module.findByIdAndUpdate(doc.module, {
    $inc: { totalLessons: doc.isNew ? 1 : 0 },
  });

  // Update course lesson count
  if (doc.isNew) {
    await Course.findByIdAndUpdate(doc.course, {
      $inc: { totalLessons: 1 },
    });
  }
});

// ─── Post-remove Hook: Decrement module and course lesson counts ──────────────

LessonSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Module = mongoose.model("Module");
    const Course = mongoose.model("Course");

    await Module.findByIdAndUpdate(doc.module, {
      $inc: { totalLessons: -1 },
    });

    await Course.findByIdAndUpdate(doc.course, {
      $inc: { totalLessons: -1 },
    });
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

LessonSchema.methods.getDurationFormatted = function (): string {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

LessonSchema.methods.getVideoDurationFormatted = function (): string {
  if (!this.videoDuration) return "0:00";

  const hours = Math.floor(this.videoDuration / 3600);
  const minutes = Math.floor((this.videoDuration % 3600) / 60);
  const seconds = this.videoDuration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Lesson: Model<ILesson> = mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;