// src/services/lessonService.ts
//
// Lesson Service — handles business logic for lesson operations.
// This file wraps the lesson API calls with error handling and additional logic.

import { lessonApi } from "../api/lessonApi";

// ─── Lesson Service ───────────────────────────────────────────────────────────

export const lessonService = {
  /**
   * Fetch all lessons for a specific module
   */
  getLessonsByModule: async (moduleId: string) => {
    try {
      const response = await lessonApi.getLessonsByModule(moduleId);
      return response.data;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
  },

  /**
   * Fetch a single lesson by ID
   */
  getLessonById: async (id: string) => {
    try {
      const response = await lessonApi.getLessonById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      throw error;
    }
  },

  /**
   * Create a new lesson (Admin/Instructor only)
   */
  createLesson: async (data: any) => {
    try {
      const response = await lessonApi.createLesson(data);
      return response.data;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  },

  /**
   * Update an existing lesson (Admin/Instructor only)
   */
  updateLesson: async (id: string, data: any) => {
    try {
      const response = await lessonApi.updateLesson(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
  },

  /**
   * Delete a lesson (Admin/Instructor only)
   */
  deleteLesson: async (id: string) => {
    try {
      const response = await lessonApi.deleteLesson(id);
      return response;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  },

  getLessonResources: async (lessonId: string) => {
    try {
      const response = await lessonApi.getLessonResources(lessonId);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson resources:", error);
      throw error;
    }
  },

  addLessonResource: async (lessonId: string, data: any) => {
    try {
      const response = await lessonApi.addLessonResource(lessonId, data);
      return response.data;
    } catch (error) {
      console.error("Error adding resource:", error);
      throw error;
    }
  },

  deleteLessonResource: async (lessonId: string, resourceId: string) => {
    try {
      const response = await lessonApi.deleteLessonResource(lessonId, resourceId);
      return response;
    } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  },

  downloadLessonResource: async (lessonId: string, resourceId: string) => {
    try {
      const response = await lessonApi.downloadLessonResource(lessonId, resourceId);
      return response.data;
    } catch (error) {
      console.error("Error downloading resource:", error);
      throw error;
    }
  },
};