import { Router } from "express";
import * as courseController from "../controllers/courseController.js";
import { uploadMemory, handleUploadError } from "../middleware/uploadMiddleware.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authenticate, authorize("instructor", "admin"), courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.get("/featured", courseController.getFeaturedCourses);
router.get("/top-rated", courseController.getTopRatedCourses);
router.get("/my-courses", authenticate, authorize("instructor", "admin"), courseController.getMyCourses);
router.get("/{:id}", courseController.getCourseById);
router.get("/slug/{:slug}", courseController.getCourseBySlug);
router.put("/{:id}", authenticate, authorize("instructor", "admin"), courseController.updateCourse);
router.delete("/{:id}", authenticate, authorize("instructor", "admin"), courseController.deleteCourse);
router.put("/{:id}/thumbnail", authenticate, authorize("instructor", "admin"), uploadMemory.single("thumbnail"), handleUploadError, courseController.uploadCourseThumbnail);
router.post("/upload/presigned-url", authenticate, authorize("instructor", "admin"), courseController.getUploadPresignedUrl);
router.post("/upload/multipart/initiate", authenticate, authorize("instructor", "admin"), courseController.initiateMultipartUpload);
router.post("/upload/multipart/part", authenticate, authorize("instructor", "admin"), courseController.getMultipartPartUrl);
router.post("/upload/multipart/complete", authenticate, authorize("instructor", "admin"), courseController.completeMultipartUpload);
router.post("/upload/multipart/abort", authenticate, authorize("instructor", "admin"), courseController.abortMultipartUpload);

export default router;
