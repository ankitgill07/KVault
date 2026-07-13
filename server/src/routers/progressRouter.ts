import { Router } from "express";
import * as progressController from "../controllers/progressController.js";

const router = Router();

// Post play currentTime updates
router.post("/video", progressController.updateVideoProgress);

// Retrieve course-wide lesson progresses and completion percentages
router.get("/course/:courseId", progressController.getCourseProgress);
router.get("/course/{:courseId}", progressController.getCourseProgress);

// Retrieve user's recently watched lessons log
router.get("/recent", progressController.getRecentlyWatched);

export default router;
