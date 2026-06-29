import { type Response } from "express";
import { type AuthenticatedRequest } from "../types/type.js";
import * as courseService from "../services/cousers/couserService.js";
import { sendSuccess, sendError } from "../utils/responseUtil.js";

export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id as string;
    if (!instructorId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const course = await courseService.createCourse(req.body as any, instructorId);
    sendSuccess(res, "Course created successfully", course, 201);
  } catch (error: any) {
    console.error("[createCourse]", error);
    sendError(res, error.message || "Failed to create course", 400);
  }
};

export const getAllCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const query = req.query as any;
    const result = await courseService.getAllCourses(query);
    sendSuccess(res, "Courses fetched successfully", result);
  } catch (error: any) {
    console.error("[getAllCourses]", error);
    sendError(res, "Failed to fetch courses", 500);
  }
};

export const getCourseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const courseId = Array.isArray(id) ? id[0] : id;
    if (!courseId) {
      sendError(res, "Course ID is required", 400);
      return;
    }
    const course = await courseService.getCourseById(courseId);
    sendSuccess(res, "Course fetched successfully", course);
  } catch (error: any) {
    console.error("[getCourseById]", error);
    if (error.message === "Course not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to fetch course", 500);
    }
  }
};

export const getCourseBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const slugValue = Array.isArray(slug) ? slug[0] : slug;
    if (!slugValue) {
      sendError(res, "Course slug is required", 400);
      return;
    }
    const course = await courseService.getCourseBySlug(slugValue);
    sendSuccess(res, "Course fetched successfully", course);
  } catch (error: any) {
    console.error("[getCourseBySlug]", error);
    if (error.message === "Course not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to fetch course", 500);
    }
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const courseId = Array.isArray(id) ? id[0] : id;
    if (!courseId) {
      sendError(res, "Course ID is required", 400);
      return;
    }
    const course = await courseService.updateCourse(courseId, req.body as any);
    if (!course) {
      sendError(res, "Course not found", 404);
      return;
    }
    sendSuccess(res, "Course updated successfully", course);
  } catch (error: any) {
    console.error("[updateCourse]", error);
    sendError(res, error.message || "Failed to update course", 400);
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const courseId = Array.isArray(id) ? id[0] : id;
    if (!courseId) {
      sendError(res, "Course ID is required", 400);
      return;
    }
    await courseService.deleteCourse(courseId);
    sendSuccess(res, "Course deleted successfully");
  } catch (error: any) {
    console.error("[deleteCourse]", error);
    if (error.message === "Course not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to delete course", 500);
    }
  }
};

export const getFeaturedCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const courses = await courseService.getFeaturedCourses(limit);
    sendSuccess(res, "Featured courses fetched successfully", courses);
  } catch (error: any) {
    console.error("[getFeaturedCourses]", error);
    sendError(res, "Failed to fetch featured courses", 500);
  }
};

export const getTopRatedCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const courses = await courseService.getTopRatedCourses(limit);
    sendSuccess(res, "Top rated courses fetched successfully", courses);
  } catch (error: any) {
    console.error("[getTopRatedCourses]", error);
    sendError(res, "Failed to fetch top rated courses", 500);
  }
};

export const getMyCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id as string;
    if (!instructorId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const courses = await courseService.getCoursesByInstructor(instructorId);
    sendSuccess(res, "Your courses fetched successfully", courses);
  } catch (error: any) {
    console.error("[getMyCourses]", error);
    sendError(res, "Failed to fetch your courses", 500);
  }
};




