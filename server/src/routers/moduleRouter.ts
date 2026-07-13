import { Router } from "express";
import * as moduleController from "../controllers/moduleController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/", authenticate, authorize("instructor", "admin") ,moduleController.createModule);
router.get("/:courseId/modules", moduleController.getModulesByCourse);
router.get("/:id", moduleController.getModuleById);
router.put("/:id", authenticate, authorize("instructor", "admin"), moduleController.updateModule);
router.delete("/:id", authenticate, authorize("instructor", "admin"), moduleController.deleteModule);

export default router;