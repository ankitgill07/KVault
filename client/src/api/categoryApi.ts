
import { axiosInstance } from "./axoisInstance";

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
   slug: string;  
  image?: string;
  parentCategory?: string | Category;
  subcategories?: Category[];
  courseCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data:  Category[]
}

export interface CategoriesListResponse {
  success: boolean;
  message: string;
  data: Category[];

}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
  isActive?: boolean;
}

// ─── Category API ─────────────────────────────────────────────────────────────

export const categoryApi = {
  /**
   * GET /categories
   * Get all categories
   */
  getAllCategories: async (): Promise<CategoriesListResponse> => {
    const response = await axiosInstance.get("/categories");
    return response.data;
  },

  /**
   * GET /categories/{id}
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * POST /categories
   * Create a new category (Admin only)
   */
  createCategory: async (data: CreateCategoryData): Promise<CategoryResponse> => {
    const response = await axiosInstance.post("/categories", data);
    return response.data;
  },

  /**
   * PUT /categories/{id}
   * Update an existing category (Admin only)
   */
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<CategoryResponse> => {
    const response = await axiosInstance.put(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /categories/{id}
   * Delete a category (Admin only)
   */
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};