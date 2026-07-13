import { Router } from "express";
import * as lessonController from "../controllers/lessonController.js";
import { authenticate, optionalAuthenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// ─── CRUD (require authentication) ───────────────────────────────────────────
router.post("/", authenticate, authorize("instructor", "admin"), lessonController.createLesson);
router.get("/:moduleId/lessons", lessonController.getLessonsByModule);
router.get("/:id", lessonController.getLessonById);
router.put("/:id", authenticate, authorize("instructor", "admin"), lessonController.updateLesson);
router.delete("/:id", authenticate, authorize("instructor", "admin"), lessonController.deleteLesson);

// ─── Secure Video Streaming ──────────────────────────────────────────────────

// Stream the video (supports preview without auth, paid with auth + session)
router.get("/:id/stream", optionalAuthenticate, lessonController.getLessonStream);

// Create a stream session (paid lessons only — requires auth + enrollment)
router.post("/:id/stream-session", authenticate, lessonController.createStreamSession);

// Heartbeat to keep a stream session alive
router.post("/:id/heartbeat", authenticate, lessonController.handleHeartbeat);

export default router;
