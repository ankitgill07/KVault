// ─── Lesson Services ──────────────────────────────────────────────────────────

import type { ILesson } from "../../interfaces/courseInterfaces.js";
import Course from "../../models/courseModel.js";
import Lesson from "../../models/lessonModel.js";
import Module from "../../models/moduleModel.js";
import type {
  CreateLessonBody,
  UpdateLessonBody,
} from "../../types/courseTypes.js";
import Resource from "../../models/resourceModel.js";
import { deleteFileFromR2, deleteFolderFromR2 } from "../video/cloudflareR2Service.js";

export const createLesson = async (data: CreateLessonBody): Promise<any> => {
  try {
    // Verify module and course exist
    const [module, course] = await Promise.all([
      Module.findById(data.module),
      Course.findById(data.course),
    ]);

    if (!module) throw new Error("Module not found");
    if (!course) throw new Error("Course not found");

    const lesson = await Lesson.create(data as unknown as ILesson);
    return lesson;
  } catch (error) {
    throw error;
  }
};

export const getLessonsByModule = async (moduleId: string): Promise<any[]> => {
  try {
    return await Lesson.find({ module: moduleId }).sort({ order: 1 });
  } catch (error) {
    throw error;
  }
};

export const getLessonById = async (id: string): Promise<any> => {
  try {
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Increment view count
    await Lesson.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return lesson;
  } catch (error) {
    throw error;
  }
};

export const updateLesson = async (
  id: string,
  data: UpdateLessonBody,
): Promise<any> => {
  try {
    const existingLesson = await Lesson.findById(id);
    if (!existingLesson) {
      throw new Error("Lesson not found");
    }

    const previousDurationSeconds = existingLesson.durationSeconds || 0;
    const lesson = await Lesson.findByIdAndUpdate(id, data, { returnDocument: "after" });
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (typeof data.durationSeconds === "number" && data.durationSeconds !== previousDurationSeconds) {
      const durationDelta = data.durationSeconds - previousDurationSeconds;
      if (durationDelta !== 0) {
        await Promise.all([
          Module.findByIdAndUpdate(lesson.module, { $inc: { duration: durationDelta } }),
          Course.findByIdAndUpdate(lesson.course, { $inc: { duration: durationDelta } }),
        ]);
      }
    }

    return lesson;
  } catch (error) {
    throw error;
  }
};

export const deleteLesson = async (id: string): Promise<void> => {
  try {
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Delete video files from R2
    if (lesson.videoKey) {
      await deleteFileFromR2(lesson.videoKey);
    }
    // Delete HLS transcoded folder from R2
    await deleteFolderFromR2(`processed/lectures/${id}`);

    // Delete associated resources
    await Resource.deleteMany({ lesson: id });

    // Delete lesson
    await Lesson.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};
