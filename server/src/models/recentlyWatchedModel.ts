import mongoose, { Schema, Model, Document } from "mongoose";
import type { IUser } from "../interfaces/interfaces.js";
import type { ICourse, ILesson } from "../interfaces/courseInterfaces.js";

export interface IRecentlyWatched extends Document {
  student: mongoose.Types.ObjectId | IUser;
  course: mongoose.Types.ObjectId | ICourse;
  lesson: mongoose.Types.ObjectId | ILesson;
  watchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecentlyWatchedSchema = new Schema<IRecentlyWatched>(
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
    watchedAt: {
      type: Date,
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
  }
);

// Unique compound index so a student only has one recently watched record per lesson in a course,
// and we can easily query and sort by watchedAt.
RecentlyWatchedSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true });
RecentlyWatchedSchema.index({ student: 1, watchedAt: -1 });

const RecentlyWatched: Model<IRecentlyWatched> = mongoose.model<IRecentlyWatched>(
  "RecentlyWatched",
  RecentlyWatchedSchema
);

export default RecentlyWatched;
