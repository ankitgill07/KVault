// src/api/moduleApi.ts
//
// Module API — handles all HTTP communication with the server module endpoints.
// This file is the single source of truth for module API calls.

import { axiosInstance } from "./axoisInstance";
import type { Lesson } from "./lessonApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Module {
  _id: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  lessons: Lesson[];
}

export interface ModuleResponse {
  success: boolean;
  message: string;
  data: Module
}

export interface ModulesListResponse {
  success: boolean;
  message: string;
  data: Module[]
}

export interface CreateModuleData {
  course: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  isPublished?: boolean;
  isFree?: boolean;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  order?: number;
  duration?: number;
  isPublished?: boolean;
  isFree?: boolean;
}

// ─── Module API ───────────────────────────────────────────────────────────────

export const moduleApi = {
  /**
   * GET /module/{courseId}/modules
   * Fetch all modules for a specific course
   */
  getModulesByCourse: async (courseId: string): Promise<ModulesListResponse> => {
    const response = await axiosInstance.get(`/module/${courseId}/modules`);
    return response.data;
  },

  /**
   * GET /modules/{id}
   * Fetch a single module by ID
   */
  getModuleById: async (id: string): Promise<ModuleResponse> => {
    const response = await axiosInstance.get(`/modules/${id}`);
    return response.data;
  },

  /**
   * POST /modules
   * Create a new module (Admin/Instructor only)
   */
  createModule: async (data: CreateModuleData): Promise<ModuleResponse> => {
    const response = await axiosInstance.post("/modules", data);
    return response.data;
  },

  /**
   * PUT /modules/{id}
   * Update an existing module (Admin/Instructor only)
   */
  updateModule: async (id: string, data: UpdateModuleData): Promise<ModuleResponse> => {
    const response = await axiosInstance.put(`/modules/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /modules/{id}
   * Delete a module (Admin/Instructor only)
   */
  deleteModule: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/modules/${id}`);
    return response.data;
  },
};