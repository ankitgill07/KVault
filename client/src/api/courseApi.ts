// src/api/courseApi.ts
//
// Course API — handles all HTTP communication with the server course endpoints.
// This file is the single source of truth for course API calls.

import { axiosInstance } from "./axoisInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Course {
  _id: string;
  title: string;
  description: string;
  slug: string;
  level: string;
  language: string;
  duration: number;
  totalLessons: number;
  totalModules: number;
  price: number;
  previewVideo: string;
  discountPrice?: number;
  thumbnail: string;
  requirements: string[];
  learningOutcomes: string[];
  rating: number;
  enrollmentCount: number;
  reviewCount: number;
  category?: any;
  instructors?: any[];
  instructorAvatar: string;
  primaryInstructor?: any;
  updatedAt : number
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course;
}

export interface CoursesListResponse {
  success: boolean;
  message: string;
  data: {
    courses: Course[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  previewVideo?: string;
  price: number;
  discountPrice?: number;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  duration: number;
  category: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  previewVideo?: string;
  price?: number;
  discountPrice?: number;
  level?: "beginner" | "intermediate" | "advanced";
  language?: string;
  duration?: number;
  category?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

// ─── Course API ───────────────────────────────────────────────────────────────

export const courseApi = {
  /**
   * GET /courses
   * Get all courses with filters
   */
  getAllCourses: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    language?: string;
    isPublished?: boolean;
    featured?: boolean;
    search?: string;
    tags?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<CoursesListResponse> => {
    const response = await axiosInstance.get("/courses", { params });
    return response.data;
  },

  /**
   * GET /courses/featured
   * Get featured courses
   */
  getFeaturedCourses: async (
    limit: number = 10,
  ): Promise<CoursesListResponse> => {
    const response = await axiosInstance.get("/courses/featured", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * GET /courses/top-rated
   * Get top rated courses
   */
  getTopRatedCourses: async (
    limit: number = 10,
  ): Promise<CoursesListResponse> => {
    const response = await axiosInstance.get("/courses/top-rated", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * GET /courses/my-courses
   * Get my courses (Instructor)
   */
  getMyCourses: async (): Promise<CoursesListResponse> => {
    const response = await axiosInstance.get("/courses/my-courses");
    return response.data;
  },

  /**
   * GET /courses/{id}
   * Get course by ID
   */
  getCourseById: async (id: string): Promise<CourseResponse> => {
    const response = await axiosInstance.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * GET /courses/slug/{slug}
   * Get course by slug
   */
  getCourseBySlug: async (slug: string): Promise<CourseResponse> => {
    const response = await axiosInstance.get(`/courses/slug/${slug}`);
    return response.data;
  },

  /**
   * POST /courses
   * Create course (Instructor/Admin)
   */
  createCourse: async (data: CreateCourseData): Promise<CourseResponse> => {
    const response = await axiosInstance.post("/courses", data);
    return response.data;
  },

  /**
   * PUT /courses/{id}
   * Update course
   */
  updateCourse: async (
    id: string,
    data: UpdateCourseData,
  ): Promise<CourseResponse> => {
    const response = await axiosInstance.put(`/courses/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /courses/{id}
   * Delete course
   */
  deleteCourse: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/courses/${id}`);
    return response.data;
  },
};
