import { Router } from "express";
import * as courseController from "../controllers/courseController.js";

const router = Router();

router.post("/", courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.get("/featured", courseController.getFeaturedCourses);
router.get("/top-rated", courseController.getTopRatedCourses);
router.get("/my-courses", courseController.getMyCourses);
router.get("/{:id}", courseController.getCourseById);
router.get("/slug/{:slug}", courseController.getCourseBySlug);
router.put("/{:id}", courseController.updateCourse);
router.delete("/{:id}", courseController.deleteCourse);

export default router;
