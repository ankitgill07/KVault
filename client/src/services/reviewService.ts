// src/services/reviewService.ts
//
// Review Service — handles business logic for review operations.
// This file wraps the review API calls with error handling and additional logic.

import { reviewApi } from "../api/reviewApi";

// ─── Review Service ───────────────────────────────────────────────────────────

export const reviewService = {
  /**
   * Get reviews for a specific course
   */
  getReviewsByCourse: async (courseId: string, page: number = 1, limit: number = 10) => {
    try {
      const response = await reviewApi.getReviewsByCourse(courseId, page, limit);
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  /**
   * Get review by ID
   */
  getReviewById: async (id: string) => {
    try {
      const response = await reviewApi.getReviewById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching review:", error);
      throw error;
    }
  },

  /**
   * Create a new review
   */
  createReview: async (data: any) => {
    try {
      const response = await reviewApi.createReview(data);
      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  /**
   * Update an existing review
   */
  updateReview: async (id: string, data: any) => {
    try {
      const response = await reviewApi.updateReview(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  deleteReview: async (id: string) => {
    try {
      const response = await reviewApi.deleteReview(id);
      return response;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};