import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  AddToCartSchema,
} from '../schemas/cartWishlistSchemas.js';
import { validateBody } from '../middleware/vaildateMiddleware.js';

const router = Router();

// All routes here are protected and require authentication
router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, validateBody(AddToCartSchema), cartController.addToCart);
router.delete('/items/{:courseId}', authenticate, cartController.removeFromCart);
router.post('/checkout', authenticate, cartController.checkout);

export default router;
