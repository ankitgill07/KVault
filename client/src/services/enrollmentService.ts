// src/services/enrollmentService.ts
//
// Enrollment Service — handles business logic for enrollment operations.
// This file wraps the enrollment API calls with error handling and additional logic.

import { enrollmentApi } from "../api/enrollmentApi";

// ─── Enrollment Service ───────────────────────────────────────────────────────

export const enrollmentService = {
  /**
   * Enroll in a course
   */
  enrollInCourse: async (data: any) => {
    try {
      const response = await enrollmentApi.enrollInCourse(data);
      return response.data;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error;
    }
  },

  /**
   * Get current user's enrollments
   */
  getMyEnrollments: async () => {
    try {
      const response = await enrollmentApi.getMyEnrollments();
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw error;
    }
  },

  /**
   * Get enrollment by ID
   */
  getEnrollmentById: async (id: string) => {
    try {
      const response = await enrollmentApi.getEnrollmentById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      throw error;
    }
  },

  /**
   * Update enrollment
   */
  updateEnrollment: async (id: string, data: any) => {
    try {
      const response = await enrollmentApi.updateEnrollment(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating enrollment:", error);
      throw error;
    }
  },

  /**
   * Update course progress
   */
  updateProgress: async (data: any) => {
    try {
      const response = await enrollmentApi.updateProgress(data);
      return response.data;
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  },
};