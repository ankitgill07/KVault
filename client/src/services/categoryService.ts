// src/services/categoryService.ts
//
// Category Service — handles business logic for category operations.
// This file wraps the category API calls with error handling and additional logic.

import { categoryApi } from "../api/categoryApi";

// ─── Category Service ─────────────────────────────────────────────────────────

export const categoryService = {
  /**
   * Get all categories
   */
  getAllCategories: async () => {
    try {
      const response = await categoryApi.getAllCategories();
      
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string) => {
    try {
      const response = await categoryApi.getCategoryById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  /**
   * Create a new category (Admin only)
   */
  createCategory: async (data: any) => {
    try {
      const response = await categoryApi.createCategory(data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  /**
   * Update an existing category (Admin only)
   */
  updateCategory: async (id: string, data: any) => {
    try {
      const response = await categoryApi.updateCategory(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  /**
   * Delete a category (Admin only)
   */
  deleteCategory: async (id: string) => {
    try {
      const response = await categoryApi.deleteCategory(id);
      return response;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};