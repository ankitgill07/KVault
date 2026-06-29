import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/profile", userController.getProfile);

export default router;
