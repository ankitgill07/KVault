import { type Response } from "express";
import type { AuthenticatedRequest } from "../types/type.js";
import { sendError, sendSuccess } from "../utils/responseUtil.js";
import * as reviewSerivce from "../services/cousers/reviewService.js";


export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id as string;
    if (!studentId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const review = await reviewSerivce.createReview(req.body as any, studentId);
    sendSuccess(res, "Review created successfully", review, 201);
  } catch (error: any) {
    console.error("[createReview]", error);
    sendError(res, error.message || "Failed to create review", 400);
  }
};

export const getReviewsByCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const courseIdValue = Array.isArray(courseId) ? courseId[0] : courseId;
    if (!courseIdValue) {
      sendError(res, "Course ID is required", 400);
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await reviewSerivce.getReviewsByCourse(courseIdValue, page, limit);
    sendSuccess(res, "Reviews fetched successfully", result);
  } catch (error: any) {
    console.error("[getReviewsByCourse]", error);
    sendError(res, "Failed to fetch reviews", 500);
  }
};

export const getReviewById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reviewId = Array.isArray(id) ? id[0] : id;
    if (!reviewId) {
      sendError(res, "Review ID is required", 400);
      return;
    }
    const review = await reviewSerivce.getReviewById(reviewId);
    if (!review) {
      sendError(res, "Review not found", 404);
      return;
    }
    sendSuccess(res, "Review fetched successfully", review);
  } catch (error: any) {
    console.error("[getReviewById]", error);
    sendError(res, "Failed to fetch review", 500);
  }
};

export const updateReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reviewId = Array.isArray(id) ? id[0] : id;
    if (!reviewId) {
      sendError(res, "Review ID is required", 400);
      return;
    }
    const review = await reviewSerivce.updateReview(reviewId, req.body as any);
    if (!review) {
      sendError(res, "Review not found", 404);
      return;
    }
    sendSuccess(res, "Review updated successfully", review);
  } catch (error: any) {
    console.error("[updateReview]", error);
    sendError(res, error.message || "Failed to update review", 400);
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reviewId = Array.isArray(id) ? id[0] : id;
    if (!reviewId) {
      sendError(res, "Review ID is required", 400);
      return;
    }
    await reviewSerivce.deleteReview(reviewId);
    sendSuccess(res, "Review deleted successfully");
  } catch (error: any) {
    console.error("[deleteReview]", error);
    sendError(res, "Failed to delete review", 500);
  }
};