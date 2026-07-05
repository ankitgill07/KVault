// src/api/lessonApi.ts
//
// Lesson API — handles all HTTP communication with the server lesson endpoints.
// This file is the single source of truth for lesson API calls.

import { axiosInstance } from "./axoisInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Lesson {
  _id: string;
  title: string;
  duration: number;
  description?: string;
  isPreview?: boolean;
  order: number;
  videoUrl: string;
}

export interface LessonResponse {
  success: boolean;
  message: string;
  data: Lesson;
}

export interface LessonsListResponse {
  success: boolean;
  message: string;
  data: Lesson[];
}

export interface CreateLessonData {
  module: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPublished?: boolean;
  isFree?: boolean;
  resources?: Array<{
    name: string;
    type: string;
    url: string;
    size?: number;
  }>;
  quiz?: string;
}

export interface UpdateLessonData {
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPublished?: boolean;
  isFree?: boolean;
  resources?: Array<{
    name: string;
    type: string;
    url: string;
    size?: number;
  }>;
  quiz?: string;
}

// ─── Lesson API ───────────────────────────────────────────────────────────────

export const lessonApi = {
  /**
   * GET /lessons/{moduleId}/lessons
   * Fetch all lessons for a specific module
   */
  getLessonsByModule: async (
    moduleId: string,
  ): Promise<LessonsListResponse> => {
    const response = await axiosInstance.get(`/lessons/${moduleId}/lessons`);
    return response.data;
  },

  /**
   * GET /lessons/{id}
   * Fetch a single lesson by ID
   */
  getLessonById: async (id: string): Promise<LessonResponse> => {
    const response = await axiosInstance.get(`/lessons/${id}`);
    return response.data;
  },

  /**
   * POST /lessons
   * Create a new lesson (Admin/Instructor only)
   */
  createLesson: async (data: CreateLessonData): Promise<LessonResponse> => {
    const response = await axiosInstance.post("/lessons", data);
    return response.data;
  },

  /**
   * PUT /lessons/{id}
   * Update an existing lesson (Admin/Instructor only)
   */
  updateLesson: async (
    id: string,
    data: UpdateLessonData,
  ): Promise<LessonResponse> => {
    const response = await axiosInstance.put(`/lessons/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /lessons/{id}
   * Delete a lesson (Admin/Instructor only)
   */
  deleteLesson: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/lessons/${id}`);
    return response.data;
  },
};
