// src/api/lessonApi.ts
//
// Lesson API — handles all HTTP communication with the server lesson endpoints.
// This file is the single source of truth for lesson API calls.

import { axiosInstance } from "./axoisInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  isPreview?: boolean;
  order: number;
  videoUrl: string;
  videoKey?: string;
  videoStatus?: 'pending' | 'processing' | 'ready' | 'failed';
  contentType?: string;
  course?: string;
  module?: string;
  content_text?: string;
  content_url?: string;
  lesson_type?: string;
  durationSeconds : number;
  duration?: number;
  is_free_preview?: boolean;
  textContent?: string;
  markdownContent?: string;
  isFree?: boolean;
  isPublished?: boolean;
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
  course: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoKey?: string;
  videoStatus?: 'pending' | 'processing' | 'ready' | 'failed';
  durationSeconds?: number;
  order: number;
  contentType?: string;
  isPublished?: boolean;
  isFree?: boolean;
  isPreview?: boolean;
  textContent?: string;
  markdownContent?: string;
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
  videoKey?: string;
  videoStatus?: 'pending' | 'processing' | 'ready' | 'failed';
  durationSeconds?: number;
  order?: number;
  contentType?: string;
  isPublished?: boolean;
  isFree?: boolean;
  isPreview?: boolean;
  textContent?: string;
  markdownContent?: string;
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

  getLessonResources: async (lessonId: string): Promise<any> => {
    const response = await axiosInstance.get(`/lessons/${lessonId}/resources`);
    return response.data;
  },

  addLessonResource: async (lessonId: string, data: any): Promise<any> => {
    const response = await axiosInstance.post(`/lessons/${lessonId}/resources`, data);
    return response.data;
  },

  deleteLessonResource: async (lessonId: string, resourceId: string): Promise<any> => {
    const response = await axiosInstance.delete(`/lessons/${lessonId}/resources/${resourceId}`);
    return response.data;
  },

  downloadLessonResource: async (lessonId: string, resourceId: string): Promise<any> => {
    const response = await axiosInstance.get(`/lessons/${lessonId}/resources/${resourceId}/download`);
    return response.data;
  },
};
