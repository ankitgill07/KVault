import * as categorySerivce from "../services/cousers/categorySerivce.js";
import type { AuthenticatedRequest } from "../types/type.js";
import { sendError, sendSuccess } from "../utils/responseUtil.js";
import { type Response } from "express";

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await categorySerivce.createCategory(req.body as any);
    sendSuccess(res, "Category created successfully", category, 201);
  } catch (error: any) {
    console.error("[createCategory]", error);
    sendError(res, error.message || "Failed to create category", 400);
  }
};

export const getAllCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await categorySerivce.getAllCategories();
    sendSuccess(res, "Categories fetched successfully", categories);
  } catch (error: any) {
    console.error("[getAllCategories]", error);
    sendError(res, "Failed to fetch categories", 500);
  }
};

export const getCategoryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    if (!categoryId) {
      sendError(res, "Category ID is required", 400);
      return;
    }
    const category = await categorySerivce.getCategoryById(categoryId);
    if (!category) {
      sendError(res, "Category not found", 404);
      return;
    }
    sendSuccess(res, "Category fetched successfully", category);
  } catch (error: any) {
    console.error("[getCategoryById]", error);
    sendError(res, "Failed to fetch category", 500);
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    if (!categoryId) {
      sendError(res, "Category ID is required", 400);
      return;
    }
    const category = await categorySerivce.updateCategory(categoryId, req.body as any);
    if (!category) {
      sendError(res, "Category not found", 404);
      return;
    }
    sendSuccess(res, "Category updated successfully", category);
  } catch (error: any) {
    console.error("[updateCategory]", error);
    sendError(res, error.message || "Failed to update category", 400);
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    if (!categoryId) {
      sendError(res, "Category ID is required", 400);
      return;
    }
    await categorySerivce.deleteCategory(categoryId);
    sendSuccess(res, "Category deleted successfully");
  } catch (error: any) {
    console.error("[deleteCategory]", error);
    sendError(res, "Failed to delete category", 500);
  }
};