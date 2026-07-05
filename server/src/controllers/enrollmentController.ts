import type { AuthenticatedRequest } from "../types/type.js";
import { sendError, sendSuccess } from "../utils/responseUtil.js";
import * as enrollmentSerivce from "../services/cousers/enrollmentService.js";
import  {type Response} from "express"

export const enrollInCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    if (!studentId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const enrollment = await enrollmentSerivce.createEnrollment(req.body as any, studentId);
    sendSuccess(res, "Enrolled in course successfully", enrollment, 201);
  } catch (error: any) {
    console.error("[enrollInCourse]", error);
    sendError(res, error.message || "Failed to enroll in course", 400);
  }
};

export const getMyEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    if (!studentId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const enrollments = await enrollmentSerivce.getEnrollmentsByStudent(studentId);
    sendSuccess(res, "Enrollments fetched successfully", enrollments);
  } catch (error: any) {
    console.error("[getMyEnrollments]", error);
    sendError(res, "Failed to fetch enrollments", 500);
  }
};

export const getEnrollmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const enrollmentId = Array.isArray(id) ? id[0] : id;
    if (!enrollmentId) {
      sendError(res, "Enrollment ID is required", 400);
      return;
    }
    const enrollment = await enrollmentSerivce.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      sendError(res, "Enrollment not found", 404);
      return;
    }
    sendSuccess(res, "Enrollment fetched successfully", enrollment);
  } catch (error: any) {
    console.error("[getEnrollmentById]", error);
    sendError(res, "Failed to fetch enrollment", 500);
  }
};

export const updateEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const enrollmentId = Array.isArray(id) ? id[0] : id;
    if (!enrollmentId) {
      sendError(res, "Enrollment ID is required", 400);
      return;
    }
    const enrollment = await enrollmentSerivce.updateEnrollment(enrollmentId, req.body as any);
    if (!enrollment) {
      sendError(res, "Enrollment not found", 404);
      return;
    }
    sendSuccess(res, "Enrollment updated successfully", enrollment);
  } catch (error: any) {
    console.error("[updateEnrollment]", error);
    sendError(res, error.message || "Failed to update enrollment", 400);
  }
};

export const updateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    const { courseId, lessonId, moduleId, progress, timeSpent } = req.body as any;

    if (!studentId || !courseId) {
      sendError(res, "Student ID and Course ID are required", 400);
      return;
    }

    const enrollment = await enrollmentSerivce.updateEnrollmentProgress(studentId, courseId, {
      lessonId,
      moduleId,
      progress,
      timeSpent,
    });

    sendSuccess(res, "Progress updated successfully", enrollment);
  } catch (error: any) {
    console.error("[updateProgress]", error);
    sendError(res, error.message || "Failed to update progress", 400);
  }
};

export const updateVideoProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    const { courseId, lessonId, currentTime, duration } = req.body as any;

    if (!studentId || !courseId || !lessonId) {
      sendError(res, "Student ID, Course ID, and Lesson ID are required", 400);
      return;
    }

    const result = await enrollmentSerivce.updateVideoProgress(studentId, courseId, lessonId, currentTime, duration);
    sendSuccess(res, "Video progress updated", result);
  } catch (error: any) {
    console.error("[updateVideoProgress]", error);
    sendError(res, error.message || "Failed to update video progress", 400);
  }
};

export const generateCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    const { courseId } = req.body as any;

    if (!studentId || !courseId) {
      sendError(res, "Student ID and Course ID are required", 400);
      return;
    }

    const certificate = await enrollmentSerivce.generateCertificate(studentId, courseId);
    sendSuccess(res, "Certificate generated successfully", certificate);
  } catch (error: any) {
    console.error("[generateCertificate]", error);
    sendError(res, error.message || "Failed to generate certificate", 400);
  }
};
