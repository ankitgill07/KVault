import { Router } from "express";
import * as lessonController from "../controllers/lessonController.js";


const router = Router();
router.post("/", lessonController.createLesson);
router.get("/:moduleId/lessons", lessonController.getLessonsByModule);
router.get("/:id", lessonController.getLessonById);
router.put("/:id", lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);


export default router