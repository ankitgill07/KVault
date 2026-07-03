// src/api/reviewApi.ts
//
// Review API — handles all HTTP communication with the server review endpoints.
// This file is the single source of truth for review API calls.

import { axiosInstance } from "./axoisInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Review {
  _id: string;
  course: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  helpful: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: {
    review: Review;
  };
}

export interface ReviewsListResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface CreateReviewData {
  course: string;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

// ─── Review API ───────────────────────────────────────────────────────────────

export const reviewApi = {
  /**
   * GET /{courseId}/reviews
   * Get reviews for a specific course
   */
  getReviewsByCourse: async (
    courseId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ReviewsListResponse> => {
    const response = await axiosInstance.get(`/${courseId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * GET /reviews/{id}
   * Get review by ID
   */
  getReviewById: async (id: string): Promise<ReviewResponse> => {
    const response = await axiosInstance.get(`/reviews/${id}`);
    return response.data;
  },

  /**
   * POST /reviews
   * Create a new review
   */
  createReview: async (data: CreateReviewData): Promise<ReviewResponse> => {
    const response = await axiosInstance.post("/reviews", data);
    return response.data;
  },

  /**
   * PUT /reviews/{id}
   * Update an existing review
   */
  updateReview: async (id: string, data: UpdateReviewData): Promise<ReviewResponse> => {
    const response = await axiosInstance.put(`/reviews/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /reviews/{id}
   * Delete a review
   */
  deleteReview: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/reviews/${id}`);
    return response.data;
  },
};