import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// All routes here are protected and require JWT authentication
router.get('/profile', authenticate, userController.getProfile);
router.post('/cart', authenticate, userController.toggleCart);
router.post('/wishlist', authenticate, userController.toggleWishlist);
router.post('/purchase', authenticate, userController.purchaseCart);
router.post('/progress', authenticate, userController.updateProgress);

export default router;
