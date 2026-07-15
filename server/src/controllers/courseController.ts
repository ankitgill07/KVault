import { type Response } from "express";
import { type AuthenticatedRequest } from "../types/type.js";
import * as courseService from "../services/cousers/couserService.js";
import { sendSuccess, sendError } from "../utils/responseUtil.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  initiateMultipartUpload as r2Initiate,
  getPartUploadUrl as r2GetPartUrl,
  completeMultipartUpload as r2Complete,
  abortMultipartUpload as r2Abort,
} from "../services/video/multipartUploadService.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../db/r2.js";
import Course from "../models/courseModel.js";

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
    const userId = req.user?.id as string;
    const course = await courseService.getCourseById(courseId, userId);
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
    const userId = req.user?.id as string;
    const course = await courseService.getCourseBySlug(slugValue, userId);
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
    sendSuccess(res, "Your courses fetched successfully", { courses });
  } catch (error: any) {
    console.error("[getMyCourses]", error);
    sendError(res, "Failed to fetch your courses", 500);
  }
};

export const uploadCourseThumbnail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const courseId = Array.isArray(id) ? id[0] : id;
    
    if (!courseId) {
      sendError(res, "Course ID is required", 400);
      return;
    }

    if (!req.file) {
      sendError(res, "No thumbnail file provided", 400);
      return;
    }

    const instructorId = req.user?.id as string;
    if (!instructorId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const updatedCourse = await courseService.uploadCourseThumbnail(courseId, req.file);
    sendSuccess(res, "Thumbnail uploaded successfully", updatedCourse, 200);
  } catch (error: any) {
    console.error("[uploadCourseThumbnail]", error);
    if (error.message === "Course not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, error.message || "Failed to upload thumbnail", 400);
    }
  }
};

export const getUploadPresignedUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, fileName, fileType } = req.body;
    
    if (!type || !fileName || !fileType) {
      sendError(res, "Missing required fields: type, fileName, fileType", 400);
      return;
    }

    if (!['thumbnail', 'video', 'resource'].includes(type)) {
      sendError(res, "Invalid type. Must be 'thumbnail', 'video', or 'resource'", 400);
      return;
    }

    const instructorId = req.user?.id as string;
    if (!instructorId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const presignedData = await courseService.generateUploadPresignedUrl(type, fileName, fileType, instructorId);
    sendSuccess(res, "Presigned URL generated successfully", presignedData, 200);
  } catch (error: any) {
    console.error("[getUploadPresignedUrl]", error);
    sendError(res, error.message || "Failed to generate presigned URL", 400);
  }
};

export const initiateMultipartUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileName, fileType, uploadType } = req.body;
    if (!fileName || !fileType || !uploadType) {
      sendError(res, "Missing fileName, fileType, or uploadType", 400);
      return;
    }

    const { uploadId, key } = await r2Initiate(fileName, fileType, uploadType);
    sendSuccess(res, "Multipart upload initiated", { uploadId, key });
  } catch (error: any) {
    console.error("[initiateMultipartUpload] Error:", error);
    sendError(res, "Failed to initiate multipart upload", 500);
  }
};

export const getMultipartPartUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key, uploadId, partNumber } = req.body;
    if (!key || !uploadId || !partNumber) {
      sendError(res, "Missing key, uploadId, or partNumber", 400);
      return;
    }

    const url = await r2GetPartUrl(key, uploadId, parseInt(partNumber));
    sendSuccess(res, "Presigned part URL generated", { url });
  } catch (error: any) {
    console.error("[getMultipartPartUrl] Error:", error);
    sendError(res, "Failed to generate part URL", 500);
  }
};

export const completeMultipartUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key, uploadId, parts, uploadType, id } = req.body;
    if (!key || !uploadId || !parts || !uploadType || !id) {
      sendError(res, "Missing key, uploadId, parts, uploadType, or associated ID", 400);
      return;
    }

    const finalKey = await r2Complete(key, uploadId, parts);

    const Lesson = (await import("../models/lessonModel.js")).default;
    const streamUrl = `/api/v1/lessons/${id}/stream`;
    await Lesson.findByIdAndUpdate(id, {
      videoKey: finalKey,
      videoStatus: "ready",
      videoUrl: streamUrl,
    });

    sendSuccess(res, "Video upload completed successfully.", { key: finalKey, url: streamUrl });
  } catch (error: any) {
    console.error("[completeMultipartUpload] Error:", error);
    sendError(res, "Failed to complete multipart upload", 500);
  }
};


export const abortMultipartUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { key, uploadId } = req.body;
    if (!key || !uploadId) {
      sendError(res, "Missing key or uploadId", 400);
      return;
    }
    await r2Abort(key, uploadId);
    sendSuccess(res, "Upload aborted successfully", null);
  } catch (error: any) {
    console.error("[abortMultipartUpload]", error);
    sendError(res, error.message || "Failed to abort multipart upload", 500);
  }
};

const toIdString = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as any)) {
    return String((value as any)._id);
  }
  return String(value);
};

export const getInstructorStudents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    // 1. Get all courses where primaryInstructor matches the user
    const courses = await Course.find({ primaryInstructor: userId });
    const courseIds = courses.map((c) => c._id);

    // 2. Fetch all enrollments for these courses
    const Enrollment = (await import("../models/enrollmentModel.js")).default;
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email avatar")
      .populate("course", "title price level");

    // 3. Format the data to return
    const studentsMap = new Map();
    for (const entry of enrollments) {
      if (!entry.student) continue;
      
      const student = entry.student as any;
      const course = entry.course as any;
      
      const studentId = student._id.toString();
      const courseInfo = {
        courseId: course?._id,
        title: course?.title || "Untitled Course",
        price: course?.price || 0,
        enrolledAt: entry.createdAt || entry.updatedAt,
        progress: entry.progress || 0,
        status: entry.status || "active",
      };

      if (studentsMap.has(studentId)) {
        const studentRecord = studentsMap.get(studentId);
        studentRecord.courses.push(courseInfo);
      } else {
        studentsMap.set(studentId, {
          _id: studentId,
          name: student.name,
          email: student.email,
          avatar: student.avatar || null,
          courses: [courseInfo],
        });
      }
    }

    const students = Array.from(studentsMap.values());
    sendSuccess(res, "Instructor students fetched successfully", students);
  } catch (error: any) {
    console.error("[getInstructorStudents]", error);
    sendError(res, error.message || "Failed to fetch instructor students", 500);
  }
};
