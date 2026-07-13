import type { AuthenticatedRequest } from "../types/type.js";
import type { Response } from "express";
import { sendError, sendSuccess } from "../utils/responseUtil.js";
import * as progressService from "../services/cousers/progressService.js";

/**
 * Handle updating the student's lesson video play position (currentTime) and completion status
 */
export const updateVideoProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    if (!studentId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { courseId, lessonId, currentTime, completed } = req.body;
    if (!courseId || !lessonId) {
      sendError(res, "Course ID and Lesson ID are required", 400);
      return;
    }

    const result = await progressService.updateLessonProgress(
      studentId,
      courseId,
      lessonId,
      Number(currentTime || 0),
      Boolean(completed)
    );

    sendSuccess(res, "Progress updated successfully", result);
  } catch (error: any) {
    console.error("[updateVideoProgress]", error);
    sendError(res, error.message || "Failed to update video progress", 400);
  }
};

/**
 * Get all lesson progresses and overall course progress percentage for a course
 */
export const getCourseProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    if (!studentId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    // Support both standard route params and any curly brace styles
    const courseIdRaw = req.params.courseId || req.params["{:courseId}"];
    const courseId = Array.isArray(courseIdRaw) ? courseIdRaw[0] : courseIdRaw;
    
    if (!courseId) {
      sendError(res, "Course ID is required", 400);
      return;
    }

    const result = await progressService.getCourseProgress(studentId, courseId);
    sendSuccess(res, "Course progress fetched successfully", result);
  } catch (error: any) {
    console.error("[getCourseProgress]", error);
    sendError(res, error.message || "Failed to fetch course progress", 400);
  }
};

/**
 * Get the user's recently watched lessons log
 */
export const getRecentlyWatched = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    if (!studentId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const result = await progressService.getRecentlyWatched(studentId);
    sendSuccess(res, "Recently watched logs fetched successfully", result);
  } catch (error: any) {
    console.error("[getRecentlyWatched]", error);
    sendError(res, error.message || "Failed to fetch recently watched logs", 500);
  }
};
