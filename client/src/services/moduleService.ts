// src/services/moduleService.ts
//
// Module Service — handles business logic for module operations.
// This file wraps the module API calls with error handling and additional logic.

import { moduleApi } from "../api/moduleApi";

// ─── Module Service ───────────────────────────────────────────────────────────

export const moduleService = {
  /**
   * Fetch all modules for a specific course
   */
  getModulesByCourse: async (courseId: string) => {
    try {
      const response = await moduleApi.getModulesByCourse(courseId);
      return response.data;
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw error;
    }
  },

  /**
   * Fetch a single module by ID
   */
  getModuleById: async (id: string) => {
    try {
      const response = await moduleApi.getModuleById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching module:", error);
      throw error;
    }
  },

  /**
   * Create a new module (Admin/Instructor only)
   */
  createModule: async (data: any) => {
    try {
      const response = await moduleApi.createModule(data);
      return response.data;
    } catch (error) {
      console.error("Error creating module:", error);
      throw error;
    }
  },

  /**
   * Update an existing module (Admin/Instructor only)
   */
  updateModule: async (id: string, data: any) => {
    try {
      const response = await moduleApi.updateModule(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating module:", error);
      throw error;
    }
  },

  /**
   * Delete a module (Admin/Instructor only)
   */
  deleteModule: async (id: string) => {
    try {
      const response = await moduleApi.deleteModule(id);
      return response;
    } catch (error) {
      console.error("Error deleting module:", error);
      throw error;
    }
  },
};