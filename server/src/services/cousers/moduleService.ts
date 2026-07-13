// ─── Module Services ──────────────────────────────────────────────────────────

import Course from "../../models/courseModel.js";
import Lesson from "../../models/lessonModel.js";
import Module from "../../models/moduleModel.js";
import type { CreateModuleBody, UpdateModuleBody } from "../../types/courseTypes.js";
import { deleteFileFromR2, deleteFolderFromR2 } from "../video/cloudflareR2Service.js";
import Resource from "../../models/resourceModel.js";

export const createModule = async (data: CreateModuleBody): Promise<any> => {
  try {
    // Verify course exists
    const course = await Course.findById(data.course);
    if (!course) {
      throw new Error("Course not found");
    }

    const module = await Module.create(data);
    return module;
  } catch (error) {
    throw error;
  }
};

export const getModulesByCourse = async (courseId: string): Promise<any[]> => {
  try {
    return await Module.find({ course: courseId }).sort({ order: 1 });
  } catch (error) {
    throw error;
  }
};

export const getModuleById = async (id: string): Promise<any> => {
  try {
    return await Module.findById(id);
  } catch (error) {
    throw error;
  }
};

export const updateModule = async (
  id: string,
  data: UpdateModuleBody,
): Promise<any> => {
  try {
    const module = await Module.findByIdAndUpdate(id, data, { returnDocument: "after" });
    if (!module) {
      throw new Error("Module not found");
    }
    return module;
  } catch (error) {
    throw error;
  }
};

export const deleteModule = async (id: string): Promise<void> => {
  try {
    const module = await Module.findById(id);
    if (!module) {
      throw new Error("Module not found");
    }

    // Delete all lesson videos and HLS folders from R2
    const lessons = await Lesson.find({ module: id });
    for (const lesson of lessons) {
      if (lesson.videoKey) {
        await deleteFileFromR2(lesson.videoKey);
      }
      await deleteFolderFromR2(`processed/lectures/${lesson._id}`);
    }
    // Delete associated resources
    await Resource.deleteMany({ lesson: { $in: lessons.map(l => l._id) } });

    // Delete all lessons in this module
    await Lesson.deleteMany({ module: id });

    // Delete module
    await Module.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};
