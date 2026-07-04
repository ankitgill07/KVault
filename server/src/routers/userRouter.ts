import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.post("/profile/upload-image", upload.single('image'), handleUploadError, userController.uploadProfileImage);
router.get("/achievements", userController.getAchievements);

export default router;
