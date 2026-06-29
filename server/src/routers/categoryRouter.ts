import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";


const router = Router();


router.post("/" , categoryController.createCategory);
router.get("/" , categoryController.getAllCategories);
router.get("/{:id}" , categoryController.getCategoryById);
router.put("/{:id}" , categoryController.updateCategory);
router.delete("/{:id}" , categoryController.deleteCategory);

export default router