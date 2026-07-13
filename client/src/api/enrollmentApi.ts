// src/api/enrollmentApi.ts
//
// Enrollment API — handles all HTTP communication with the server enrollment endpoints.
// This file is the single source of truth for enrollment API calls.

import { axiosInstance } from "./axoisInstance";
import type { Course } from "./courseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Enrollment {
  _id: string;
  user: string;
  course: Course;
  amountPaid: number;
  paymentMethod?: string;
  transactionId?: string;
  progress: number;
  completedLessons: string[];
  currentLesson?: string;
  currentModule?: string;
  lastAccessed?: string;
  enrolledAt: string;
  lessonProgress?: Record<string, number>;
  courseDetails?: {
    _id: string;
    title: string;
    thumbnailUrl?: string;
    instructor: {
      _id: string;
      name: string;
    };
  };
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: Enrollment;
}

export interface EnrollmentsListResponse {
  success: boolean;
  message: string;
  data: Enrollment[];
}

export interface EnrollInCourseData {
  course: string;
  amountPaid: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface UpdateProgressData {
  courseId: string;
  lessonId?: string;
  moduleId?: string;
  progress?: number;
  timeSpent?: number;
}

export interface ProgressResponse {
  success: boolean;
  message: string;
  data: {
    progress: number;
    completedLessons: string[];
    lastAccessed: string;
    totalTimeSpent: number;
  };
}

export interface VideoProgressData {
  courseId: string;
  lessonId: string;
  currentTime: number;
  duration: number;
}

export interface VideoProgressResponse {
  success: boolean;
  message: string;
  data: {
    totalTimeSpent: number;
    lastAccessedAt: string;
  };
}

export interface CertificateData {
  courseId: string;
}

export interface CertificateResponse {
  success: boolean;
  message: string;
  data: {
    certificateId: string;
    certificateUrl: string;
    issuedAt: string;
    course: {
      _id: string;
      title: string;
      thumbnailUrl?: string;
    };
    student: {
      _id: string;
      name: string;
      email: string;
    };
    completedAt: string;
  } | {
    alreadyIssued: boolean;
    certificateUrl: string;
    issuedAt: string;
  };
}

// ─── Enrollment API ───────────────────────────────────────────────────────────

export const enrollmentApi = {
  /**
   * POST /enrollments
   * Enroll in a course
   */
  enrollInCourse: async (
    data: EnrollInCourseData,
  ): Promise<EnrollmentResponse> => {
    const response = await axiosInstance.post("/enrollments", data);
    return response.data;
  },

  /**
   * GET /enrollments/my-enrollments
   * Get current user's enrollments
   */
  getMyEnrollments: async (): Promise<EnrollmentsListResponse> => {
    const response = await axiosInstance.get("/enrollments/my-enrollments");
    return response.data;
  },

  /**
   * GET /enrollments/{id}
   * Get enrollment by ID
   */
  getEnrollmentById: async (id: string): Promise<EnrollmentResponse> => {
    const response = await axiosInstance.get(`/enrollments/${id}`);
    return response.data;
  },

  /**
   * PUT /enrollments/{id}
   * Update enrollment
   */
  updateEnrollment: async (
    id: string,
    data: any,
  ): Promise<EnrollmentResponse> => {
    const response = await axiosInstance.put(`/enrollments/${id}`, data);
    return response.data;
  },

  /**
   * POST /enrollments/progress
   * Update course progress
   */
  updateProgress: async (
    data: UpdateProgressData,
  ): Promise<ProgressResponse> => {
    const response = await axiosInstance.post("/enrollments/progress", data);
    return response.data;
  },

  /**
   * POST /enrollments/video-progress
   * Update video progress (throttled)
   */
  updateVideoProgress: async (
    data: VideoProgressData,
  ): Promise<VideoProgressResponse> => {
    const response = await axiosInstance.post("/enrollments/video-progress", data);
    return response.data;
  },

  /**
   * POST /enrollments/certificate/generate
   * Generate certificate for completed course
   */
  generateCertificate: async (
    data: CertificateData,
  ): Promise<CertificateResponse> => {
    const response = await axiosInstance.post("/enrollments/certificate/generate", data);
    return response.data;
  },
};
