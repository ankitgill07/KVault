import { type Response } from "express";
import * as lessonSerivce from "../services/cousers/lessonService.js";
import { sendError, sendSuccess } from "../utils/responseUtil.js";
import type { AuthenticatedRequest } from "../types/type.js";
import Lesson from "../models/lessonModel.js";
import Course from "../models/courseModel.js";
import Enrollment from "../models/enrollmentModel.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../db/r2.js";
import { v4 as uuidv4 } from "uuid";
import {
  registerActiveStream,
  refreshStreamHeartbeat,
} from "../services/redisService.js";
import type { Readable } from "stream";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "kvaultcousers";

/** Maximum concurrent streams per user (set 0 to disable) */
const MAX_CONCURRENT_STREAMS = Number(process.env.MAX_CONCURRENT_STREAMS ?? 2);

/** Concurrent stream policy: "evict" (kill oldest) or "reject" (block new) */
const CONCURRENT_POLICY = (process.env.CONCURRENT_STREAM_POLICY || "evict") as
  | "evict"
  | "reject";

const toIdString = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as any)) {
    return String((value as any)._id);
  }
  return String(value);
};

// ─── Existing CRUD Controllers (unchanged) ────────────────────────────────────

export const createLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lesson = await lessonSerivce.createLesson(req.body as any);
    sendSuccess(res, "Lesson created successfully", lesson, 201);
  } catch (error: any) {
    console.error("[createLesson]", error);
    sendError(res, error.message || "Failed to create lesson", 400);
  }
};

export const getLessonsByModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const moduleIdValue = Array.isArray(moduleId) ? moduleId[0] : moduleId;
    if (!moduleIdValue) {
      sendError(res, "Module ID is required", 400);
      return;
    }
    const lessons = await lessonSerivce.getLessonsByModule(moduleIdValue);
    sendSuccess(res, "Lessons fetched successfully", lessons);
  } catch (error: any) {
    console.error("[getLessonsByModule]", error);
    sendError(res, "Failed to fetch lessons", 500);
  }
};

export const getLessonById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }
    const lesson = await lessonSerivce.getLessonById(lessonId);
    sendSuccess(res, "Lesson fetched successfully", lesson);
  } catch (error: any) {
    console.error("[getLessonById]", error);
    if (error.message === "Lesson not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to fetch lesson", 500);
    }
  }
};

export const updateLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }
    const lesson = await lessonSerivce.updateLesson(lessonId, req.body as any);
    if (!lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }
    sendSuccess(res, "Lesson updated successfully", lesson);
  } catch (error: any) {
    console.error("[updateLesson]", error);
    sendError(res, error.message || "Failed to update lesson", 400);
  }
};

export const deleteLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }
    await lessonSerivce.deleteLesson(lessonId);
    sendSuccess(res, "Lesson deleted successfully");
  } catch (error: any) {
    console.error("[deleteLesson]", error);
    if (error.message === "Lesson not found") {
      sendError(res, error.message, 404);
    } else {
      sendError(res, "Failed to delete lesson", 500);
    }
  }
};

// ─── Stream Session Controller ────────────────────────────────────────────────

/**
 * POST /lessons/:id/stream-session
 *
 * Creates a new stream session for a paid lesson. Validates:
 *  1. User is authenticated
 *  2. Lesson exists, is published, has a video
 *  3. User has purchased the course (enrollment), is the instructor, or is admin
 *  4. Concurrent stream limit is not exceeded (or oldest is evicted)
 *
 * Returns a unique streamSessionId the client must pass when requesting
 * the actual video stream and when sending heartbeats.
 */
export const createStreamSession = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const lessonId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }

    // ── 1. Authentication ────────────────────────────────────
    const userId = toIdString(req.user?._id);
    if (!userId) {
      sendError(res, "Authentication required", 401);
      return;
    }

    // ── 2. Lesson validation ─────────────────────────────────
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }
    if (!lesson.isPublished) {
      sendError(res, "Lesson is not published", 404);
      return;
    }
    if (!lesson.videoKey) {
      sendError(res, "Video not available for this lesson", 404);
      return;
    }

    // ── 3. Authorization ─────────────────────────────────────
    const isPreviewOrFree = lesson.isPreview || lesson.isFree;
    const userRole = req.user?.role;
    let hasAccess = false;

    if (isPreviewOrFree) {
      hasAccess = true;
    } else if (userRole === "admin") {
      hasAccess = true;
    } else {
      const course = await Course.findById(lesson.course);
      if (course) {
        if (toIdString(course.primaryInstructor) === userId) {
          hasAccess = true;
        }
      }
    }

    if (!isPreviewOrFree && !hasAccess) {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: lesson.course,
        status: "active",
      } as any);
      if (enrollment) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      sendError(
        res,
        "Access denied. Please purchase the course to watch this lesson.",
        403,
      );
      return;
    }

    // ── 4. Concurrent stream enforcement ─────────────────────
    const streamSessionId = uuidv4();

    try {
      await registerActiveStream(
        userId,
        streamSessionId,
        lessonId,
        MAX_CONCURRENT_STREAMS,
        CONCURRENT_POLICY,
      );
    } catch (err: any) {
      if (err.message === "CONCURRENT_LIMIT_EXCEEDED") {
        sendError(
          res,
          "Simultaneous stream limit exceeded. You are watching on too many devices.",
          429,
        );
        return;
      }
      throw err;
    }

    sendSuccess(res, "Stream session created", { streamSessionId }, 201);
  } catch (error: any) {
    console.error("[createStreamSession] Error:", error);
    sendError(res, "Internal server error", 500);
  }
};

// ─── Heartbeat Controller ─────────────────────────────────────────────────────

/**
 * POST /lessons/:id/heartbeat
 *
 * Renews the stream session TTL. If the session has already been evicted
 * (by another device) or expired, returns 410 Gone so the client can
 * display a notification and stop playback.
 */
export const handleHeartbeat = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = toIdString(req.user?._id);
    if (!userId) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { streamSessionId } = req.body;
    if (!streamSessionId) {
      sendError(res, "streamSessionId is required", 400);
      return;
    }

    const alive = await refreshStreamHeartbeat(userId, streamSessionId);
    if (!alive) {
      sendError(
        res,
        "Stream session expired or closed. You may be watching on another device.",
        410,
      );
      return;
    }

    sendSuccess(res, "Heartbeat acknowledged");
  } catch (error: any) {
    console.error("[handleHeartbeat] Error:", error);
    sendError(res, "Internal server error", 500);
  }
};

// ─── Secure Video Stream Controller ───────────────────────────────────────────

/**
 * GET /lessons/:id/stream
 *
 * Proxies the video from Cloudflare R2 to the browser. The browser never
 * sees R2 URLs, bucket names, or object keys. Supports HTTP Range
 * requests for seeking, fast-forward, rewind, and resuming.
 *
 * Access rules:
 *  - Preview / free lessons: anyone can watch (no login needed)
 *  - Paid lessons: requires authentication + enrollment + valid streamSessionId
 */
export const getLessonStream = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const lessonId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!lessonId) {
      res.status(400).send("Lesson ID is required");
      return;
    }

    // ── 1. Lesson validation ─────────────────────────────────
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404).send("Lesson not found");
      return;
    }
    if (!lesson.videoKey) {
      res.status(404).send("Video file not found for this lesson");
      return;
    }

    // Find course to verify if requester is instructor or admin
    const course = await Course.findById(lesson.course);
    const userId = toIdString(req.user?._id);
    const userRole = req.user?.role;
    
    const isInstructorOrAdmin = userId && (
      userRole === "admin" || 
      (course && toIdString(course.primaryInstructor) === userId)
    );

    if (!lesson.isPublished && !isInstructorOrAdmin) {
      res.status(404).send("Lesson is not available");
      return;
    }

    // ── 2. Authorization ─────────────────────────────────────
    const isPreviewOrFree = lesson.isPreview || lesson.isFree;

    if (!isPreviewOrFree && !isInstructorOrAdmin) {
      // Paid lesson — full auth required
      if (!userId) {
        res.status(401).send("Authentication required");
        return;
      }

      let hasAccess = false;
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: lesson.course,
        status: "active",
      } as any);
      if (enrollment) {
        hasAccess = true;
      }

      if (!hasAccess) {
        res
          .status(403)
          .send(
            "Access denied. Please purchase the course to watch this lesson.",
          );
        return;
      }

      // Validate stream session for concurrent protection
      const streamSessionId = req.query.ssid as string | undefined;
      if (MAX_CONCURRENT_STREAMS > 0 && !streamSessionId) {
        res.status(403).send("Missing stream session. Please restart the player.");
        return;
      }

      // Optionally verify the session is still alive in Redis
      if (MAX_CONCURRENT_STREAMS > 0 && streamSessionId) {
        const alive = await refreshStreamHeartbeat(userId, streamSessionId);
        if (!alive) {
          res
            .status(410)
            .send(
              "Stream session expired or closed. You may be watching on another device.",
            );
          return;
        }
      }
    }

    // ── 3. Build R2 GetObjectCommand ─────────────────────────
    const rangeHeader = req.headers.range;
    const commandInput: any = {
      Bucket: BUCKET_NAME,
      Key: lesson.videoKey,
    };

    if (rangeHeader) {
      commandInput.Range = rangeHeader;
    }

    const command = new GetObjectCommand(commandInput);
    const r2Response = await r2.send(command);

    if (!r2Response.Body) {
      res.status(500).send("Failed to retrieve video from storage");
      return;
    }

    // ── 4. Forward headers & status code ─────────────────────
    const statusCode = rangeHeader && r2Response.ContentRange ? 206 : 200;

    const headers: Record<string, string> = {
      "Accept-Ranges": "bytes",
    };

    if (r2Response.ContentType) {
      headers["Content-Type"] = r2Response.ContentType;
    }
    if (r2Response.ContentLength !== undefined) {
      headers["Content-Length"] = String(r2Response.ContentLength);
    }
    if (r2Response.ContentRange) {
      headers["Content-Range"] = r2Response.ContentRange;
    }
    if (r2Response.ETag) {
      headers["ETag"] = r2Response.ETag;
    }
    if (r2Response.LastModified) {
      headers["Last-Modified"] = r2Response.LastModified.toUTCString();
    }

    // Prevent browser from caching the video at public proxies
    headers["Cache-Control"] = "private, no-store";

    res.writeHead(statusCode, headers);

    // ── 5. Pipe R2 → browser (memory-efficient streaming) ────
    const r2Stream = r2Response.Body as Readable;

    // If the client disconnects mid-stream, destroy the R2 stream
    // to free up sockets and stop transferring data.
    req.on("close", () => {
      if (r2Stream && typeof r2Stream.destroy === "function") {
        r2Stream.destroy();
      }
    });

    r2Stream.pipe(res);
  } catch (error: any) {
    console.error("[getLessonStream] Error:", error);

    // Handle specific S3/R2 errors
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      res.status(404).send("Video file not found in storage");
      return;
    }

    if (error.name === "InvalidRange" || error.$metadata?.httpStatusCode === 416) {
      res.status(416).send("Range not satisfiable");
      return;
    }

    if (!res.headersSent) {
      res.status(500).send("Internal server error");
    }
  }
};

// ─── Lesson Resources Controllers ─────────────────────────────────────────────

import Resource from "../models/resourceModel.js";

export const addLessonResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const lessonId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }

    // Verify authorized user is instructor or admin
    const userId = toIdString(req.user?._id);
    const userRole = req.user?.role;
    const course = await Course.findById(lesson.course);
    const isInstructorOrAdmin = userId && (
      userRole === "admin" || 
      (course && toIdString(course.primaryInstructor) === userId)
    );

    if (!isInstructorOrAdmin) {
      sendError(res, "Unauthorized to manage this lesson's resources", 403);
      return;
    }

    const { title, description, type, url, fileName, fileSize, fileType } = req.body;

    if (!title || !type || !url) {
      sendError(res, "Missing required fields: title, type, url", 400);
      return;
    }

    // Ensure type is not video
    if (type === "video" || (fileType && fileType.startsWith("video/"))) {
      sendError(res, "Video files are not allowed as resources", 400);
      return;
    }

    const newResource = await Resource.create({
      lesson: lessonId,
      title,
      description: description || null,
      type,
      url,
      fileName: fileName || "file",
      fileSize: fileSize || 0,
      fileType: fileType || "application/octet-stream",
    });

    // Add resource reference to the lesson
    await Lesson.findByIdAndUpdate(lessonId, {
      $push: { resources: newResource._id }
    });

    sendSuccess(res, "Resource added successfully", newResource, 201);
  } catch (error: any) {
    console.error("[addLessonResource]", error);
    sendError(res, error.message || "Failed to add resource", 500);
  }
};

export const getLessonResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const lessonId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!lessonId) {
      sendError(res, "Lesson ID is required", 400);
      return;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }

    // Check authorization: if paid lesson, student must be enrolled, or be instructor/admin
    const userId = toIdString(req.user?._id);
    const userRole = req.user?.role;
    const isPreviewOrFree = lesson.isPreview || lesson.isFree;

    if (!isPreviewOrFree) {
      let hasAccess = false;
      if (userId) {
        if (userRole === "admin") {
          hasAccess = true;
        } else {
          const course = await Course.findById(lesson.course);
          if (course && toIdString(course.primaryInstructor) === userId) {
            hasAccess = true;
          } else {
            const enrollment = await Enrollment.findOne({
              student: userId,
              course: lesson.course,
              status: "active",
            } as any);
            if (enrollment) {
              hasAccess = true;
            }
          }
        }
      }

      if (!hasAccess) {
        sendError(res, "Access denied. Please purchase the course to access resources.", 403);
        return;
      }
    }

    const resources = await Resource.find({ lesson: lessonId });
    sendSuccess(res, "Resources fetched successfully", resources);
  } catch (error: any) {
    console.error("[getLessonResources]", error);
    sendError(res, error.message || "Failed to fetch resources", 500);
  }
};

export const deleteLessonResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, resourceId } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId || !resourceId) {
      sendError(res, "Lesson ID and Resource ID are required", 400);
      return;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }

    // Verify authorized user is instructor or admin
    const userId = toIdString(req.user?._id);
    const userRole = req.user?.role;
    const course = await Course.findById(lesson.course);
    const isInstructorOrAdmin = userId && (
      userRole === "admin" || 
      (course && toIdString(course.primaryInstructor) === userId)
    );

    if (!isInstructorOrAdmin) {
      sendError(res, "Unauthorized to manage this lesson's resources", 403);
      return;
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      sendError(res, "Resource not found", 404);
      return;
    }

    // If it's a file uploaded to R2, delete the file from R2
    if (resource.type !== "link") {
      try {
        const urlObj = new URL(resource.url);
        const key = urlObj.pathname.substring(1);
        if (key) {
          const { deleteFileFromR2 } = await import("../services/video/cloudflareR2Service.js");
          await deleteFileFromR2(key);
        }
      } catch (e) {
        console.error("Failed to delete resource file from R2:", e);
      }
    }

    await Resource.findByIdAndDelete(resourceId);

    // Remove resource reference from lesson
    await Lesson.findByIdAndUpdate(lessonId, {
      $pull: { resources: resourceId }
    });

    sendSuccess(res, "Resource deleted successfully");
  } catch (error: any) {
    console.error("[deleteLessonResource]", error);
    sendError(res, error.message || "Failed to delete resource", 500);
  }
};

export const downloadLessonResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, resourceId } = req.params;
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId || !resourceId) {
      sendError(res, "Lesson ID and Resource ID are required", 400);
      return;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      sendError(res, "Lesson not found", 404);
      return;
    }

    // Check authorization: if paid lesson, student must be enrolled, or be instructor/admin
    const userId = toIdString(req.user?._id);
    const userRole = req.user?.role;
    const isPreviewOrFree = lesson.isPreview || lesson.isFree;

    if (!isPreviewOrFree) {
      let hasAccess = false;
      if (userId) {
        if (userRole === "admin") {
          hasAccess = true;
        } else {
          const course = await Course.findById(lesson.course);
          if (course && toIdString(course.primaryInstructor) === userId) {
            hasAccess = true;
          } else {
            const enrollment = await Enrollment.findOne({
              student: userId,
              course: lesson.course,
              status: "active",
            } as any);
            if (enrollment) {
              hasAccess = true;
            }
          }
        }
      }

      if (!hasAccess) {
        sendError(res, "Access denied. Please purchase the course to download resources.", 403);
        return;
      }
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      sendError(res, "Resource not found", 404);
      return;
    }

    if (resource.type === "link") {
      sendSuccess(res, "Resource link fetched", { downloadUrl: resource.url });
      return;
    }

    try {
      const urlObj = new URL(resource.url);
      const key = urlObj.pathname.substring(1);
      
      const { r2GetPreSignedUrl } = await import("../services/video/cloudflareR2Service.js");
      const downloadUrl = await r2GetPreSignedUrl({
        key,
        fileName: resource.fileName,
      });

      await Resource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });

      sendSuccess(res, "Download URL generated successfully", { downloadUrl });
    } catch (e: any) {
      console.error("Failed to generate download URL for resource:", e);
      sendSuccess(res, "Resource URL fetched", { downloadUrl: resource.url });
    }
  } catch (error: any) {
    console.error("[downloadLessonResource]", error);
    sendError(res, error.message || "Failed to download resource", 500);
  }
};
