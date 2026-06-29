
import * as moduleService from "../services/cousers/moduleService.js";
import type { AuthenticatedRequest } from "../types/type.js";
import { sendError, sendSuccess } from "../utils/responseUtil.js";
import { type Response } from "express";

export const createModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const module = await moduleService.createModule(req.body as any);
    sendSuccess(res, "Module created successfully", module, 201);
  } catch (error: any) {
    console.error("[createModule]", error);
    sendError(res, error.message || "Failed to create module", 400);
  }
};

export const getModulesByCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const courseIdValue = Array.isArray(courseId) ? courseId[0] : courseId;
    if (!courseIdValue) {
      sendError(res, "Course ID is required", 400);
      return;
    }
    const modules = await moduleService.getModulesByCourse(courseIdValue);
    sendSuccess(res, "Modules fetched successfully", modules);
  } catch (error: any) {
    console.error("[getModulesByCourse]", error);
    sendError(res, "Failed to fetch modules", 500);
  }
};

export const getModuleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const moduleId = Array.isArray(id) ? id[0] : id;
    if (!moduleId) {
      sendError(res, "Module ID is required", 400);
      return;
    }
    const module = await moduleService.getModuleById(moduleId);
    if (!module) {
      sendError(res, "Module not found", 404);
      return;
    }
    sendSuccess(res, "Module fetched successfully", module);
  } catch (error: any) {
    console.error("[getModuleById]", error);
    sendError(res, "Failed to fetch module", 500);
  }
};

export const updateModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const moduleId = Array.isArray(id) ? id[0] : id;
    if (!moduleId) {
      sendError(res, "Module ID is required", 400);
      return;
    }
    const module = await moduleService.updateModule(moduleId, req.body as any);
    if (!module) {
      sendError(res, "Module not found", 404);
      return;
    }
    sendSuccess(res, "Module updated successfully", module);
  } catch (error: any) {
    console.error("[updateModule]", error);
    sendError(res, error.message || "Failed to update module", 400);
  }
};

export const deleteModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const moduleId = Array.isArray(id) ? id[0] : id;
    if (!moduleId) {
      sendError(res, "Module ID is required", 400);
      return;
    }
    await moduleService.deleteModule(moduleId);
    sendSuccess(res, "Module deleted successfully");
  } catch (error: any) {
    console.error("[deleteModule]", error);
    if (error.message === "Module not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to delete module", 500);
    }
  }
};
