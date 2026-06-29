import { Router } from 'express';
import * as wishlistController from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  AddToWishlistSchema,
} from '../schemas/cartWishlistSchemas.js';
import { validateBody } from '../middleware/vaildateMiddleware.js';

const router = Router();

// All routes here are protected and require authentication
router.get('/', authenticate, wishlistController.getWishlist);
router.post('/items', authenticate, validateBody(AddToWishlistSchema), wishlistController.addToWishlist);
router.delete('/items/:courseId', authenticate, wishlistController.removeFromWishlist);

export default router;
