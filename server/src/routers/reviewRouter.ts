import { Router } from "express";
import * as reviewController from "../controllers/reviewController.js";

const router = Router();
router.post("/", reviewController.createReview);
router.get("/{:courseId}/reviews", reviewController.getReviewsByCourse);
router.get("/{:id}", reviewController.getReviewById);
router.put("/{:id}", reviewController.updateReview);
router.delete("/{:id}", reviewController.deleteReview);



export default router