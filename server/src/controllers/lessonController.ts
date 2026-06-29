import { type Response } from "express";
import * as lessonSerivce from "../services/cousers/lessonService.js";
import { sendError, sendSuccess } from "../utils/responseUtil.js";
import type { AuthenticatedRequest } from "../types/type.js";

export const createLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lesson = await lessonSerivce.createLesson(req.body as any);
    sendSuccess(res, "Lesson created successfully", lesson, 201);
  } catch (error: any) {
    console.error("[createLesson]", error);
    sendError(res, error.message || "Failed to create lesson", 400);
  }
};

export const getLessonsByModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const moduleIdValue = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    if (!moduleIdValue) {
      sendError(res, "Module ID is required", 400);
      return;
    }
    const lessons = await lessonSerivce.getLessonsByModule(moduleIdValue);
    sendSuccess(res, "Lessons fetched successfully", lessons);
  } catch (error: any) {
    console.error("[getLessonsByModule]", error);
    sendError(res, "Failed to fetch lessons", 500);
  }
};

export const getLessonById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }
    const lesson = await lessonSerivce.getLessonById(lessonId);
    sendSuccess(res, "Lesson fetched successfully", lesson);
  } catch (error: any) {
    console.error("[getLessonById]", error);
    if (error.message === "Lesson not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to fetch lesson", 500);
    }
  }
};

export const updateLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }
    const lesson = await lessonSerivce.updateLesson(lessonId, req.body as any);
    if (!lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }
    sendSuccess(res, "Lesson updated successfully", lesson);
  } catch (error: any) {
    console.error("[updateLesson]", error);
    sendError(res, error.message || "Failed to update lesson", 400);
  }
};

export const deleteLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }
    await lessonSerivce.deleteLesson(lessonId);
    sendSuccess(res, "Lesson deleted successfully");
  } catch (error: any) {
    console.error("[deleteLesson]", error);
    if (error.message === "Lesson not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to delete lesson", 500);
    }
  }
};