import { Router } from "express";
import * as enrollmentController from "../controllers/enrollmentController.js";

const router = Router();
router.post("/", enrollmentController.enrollInCourse);
router.get("/my-enrollments", enrollmentController.getMyEnrollments);
router.get("/{:id}", enrollmentController.getEnrollmentById);
router.put("/{:id}", enrollmentController.updateEnrollment);
router.post("/progress", enrollmentController.updateProgress);

export default router