import { Router } from "express";
import * as reviewController from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/", authenticate, reviewController.createReview);
router.get("/course/:courseId", reviewController.getReviewsByCourse);
router.get("/:id", reviewController.getReviewById);
router.put("/:id", authenticate, reviewController.updateReview);
router.delete("/:id", authenticate, reviewController.deleteReview);



export default router