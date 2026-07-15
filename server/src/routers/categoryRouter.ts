import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";


const router = Router();


router.post("/" ,authenticate, categoryController.createCategory);
router.get("/" , categoryController.getAllCategories);
router.get("/:id" , categoryController.getCategoryById);
router.put("/:id" ,authenticate, categoryController.updateCategory);
router.delete("/:id",authenticate , categoryController.deleteCategory);

export default router