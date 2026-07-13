import mongoose, { Schema, Model, Document } from "mongoose";
import type { IUser } from "../interfaces/interfaces.js";
import type { ICourse, ILesson } from "../interfaces/courseInterfaces.js";

export interface ILessonProgress extends Document {
  student: mongoose.Types.ObjectId | IUser;
  course: mongoose.Types.ObjectId | ICourse;
  lesson: mongoose.Types.ObjectId | ILesson;
  watchedSeconds: number;
  lastWatchedAt: Date;
  completed: boolean;
  completedPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson reference is required"],
    },
    watchedSeconds: {
      type: Number,
      default: 0,
      min: [0, "Watched seconds cannot be negative"],
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedPercentage: {
      type: Number,
      default: 0,
      min: [0, "Completed percentage cannot be negative"],
      max: [100, "Completed percentage cannot exceed 100"],
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
  }
);

// Compound unique index so a student only has one progress record per lesson
LessonProgressSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true });
LessonProgressSchema.index({ student: 1, course: 1 });

const LessonProgress: Model<ILessonProgress> = mongoose.model<ILessonProgress>(
  "LessonProgress",
  LessonProgressSchema
);

export default LessonProgress;
