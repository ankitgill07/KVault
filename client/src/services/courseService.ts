// src/services/courseService.ts
//
// Course Service — handles business logic for course operations.
// This file wraps the course API calls with error handling and additional logic.

import { courseApi } from "../api/courseApi";

// ─── Course Service ───────────────────────────────────────────────────────────

export const courseService = {
  /**
   * Get all courses with filters
   */
  getAllCourses: async (params?: any) => {
    try {
      const response = await courseApi.getAllCourses(params);
      return response.data.courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  /**
   * Get featured courses
   */
  getFeaturedCourses: async (limit: number = 10) => {
    try {
      const response = await courseApi.getFeaturedCourses(limit);
      return response.data.courses;
    } catch (error) {
      console.error("Error fetching featured courses:", error);
      throw error;
    }
  },

  /**
   * Get top rated courses
   */
  getTopRatedCourses: async (limit: number = 10) => {
    try {
      const response = await courseApi.getTopRatedCourses(limit);
      return response.data.courses;
    } catch (error) {
      console.error("Error fetching top rated courses:", error);
      throw error;
    }
  },

  /**
   * Get my courses (Instructor)
   */
  getMyCourses: async () => {
    try {
      const response = await courseApi.getMyCourses();
      return response.data.courses;
    } catch (error) {
      console.error("Error fetching my courses:", error);
      throw error;
    }
  },

  getInstructorStudents: async () => {
    try {
      const response = await courseApi.getInstructorStudents();
      return response.data;
    } catch (error) {
      console.error("Error fetching instructor students:", error);
      throw error;
    }
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: string) => {
    try {
      const response = await courseApi.getCourseById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  /**
   * Get course by slug
   */
  getCourseBySlug: async (slug: string) => {
    try {
      const response = await courseApi.getCourseBySlug(slug);
      return response.data;
    } catch (error) {
      console.error("Error fetching course by slug:", error);
      throw error;
    }
  },

  /**
   * Create course (Instructor/Admin)
   */
  createCourse: async (data: any) => {
    try {
      const response = await courseApi.createCourse(data);
      return response.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  /**
   * Update course
   */
  updateCourse: async (id: string, data: any) => {
    try {
      const response = await courseApi.updateCourse(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  /**
   * Delete course
   */
  deleteCourse: async (id: string) => {
    try {
      const response = await courseApi.deleteCourse(id);
      return response
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  /**
   * Get presigned URL for direct upload to R2
   */
  getUploadPresignedUrl: async (data: {
    type: "thumbnail" | "video" | "resource";
    fileName: string;
    fileType: string;
  }) => {
    try {
      const response = await courseApi.getUploadPresignedUrl(data);
      return response.data;
    } catch (error) {
      console.error("Error getting presigned URL:", error);
      throw error;
    }
  },
};
