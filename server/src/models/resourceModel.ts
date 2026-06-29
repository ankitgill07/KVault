import mongoose, { Schema, Model } from "mongoose";
import  { type IResource, type ILesson, ResourceType } from "../interfaces/courseInterfaces.js";

const ResourceSchema = new Schema<IResource>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson is required"],
    },
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      maxlength: [200, "Resource title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    // ── Resource Type ───────────────────────────────────────
    type: {
      type: String,
      enum: Object.values(ResourceType),
      required: [true, "Resource type is required"],
    },

    // ── File Details ────────────────────────────────────────
    url: {
      type: String,
      required: [true, "Resource URL is required"],
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size cannot be negative"],
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      trim: true,
    },

    // ── Settings ────────────────────────────────────────────
    isDownloadable: {
      type: Boolean,
      default: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: [0, "Download count cannot be negative"],
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

ResourceSchema.index({ lesson: 1 });
ResourceSchema.index({ type: 1 });

// ─── Instance Methods ─────────────────────────────────────────────────────────

ResourceSchema.methods.getFileSizeFormatted = function (): string {
  const bytes = this.fileSize;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
};

ResourceSchema.methods.getFileExtension = function (): string {
  return this.fileName.split(".").pop() || "";
};

// ─── Model ────────────────────────────────────────────────────────────────────

const Resource: Model<IResource> = mongoose.model<IResource>(
  "Resource",
  ResourceSchema
);

export default Resource;