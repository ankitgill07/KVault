import { Router } from 'express';

import * as authController from '../controllers/authControler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/vaildateMiddleware.js';
import {
  RegisterSchema,
  LoginSchema,
  VerifyOtpSchema,
  ResendOtpSchema,
} from '../schemas/authSchem.js';
import { authLimiter, otpLimiter } from '../utils/RateLimiter.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateBody(RegisterSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validateBody(LoginSchema),
  authController.login
);

router.post(
  '/send-otp',
  otpLimiter,
  validateBody(ResendOtpSchema),
  authController.sendOtp
);

router.post(
  '/verify-otp',
  otpLimiter,
  validateBody(VerifyOtpSchema),
  authController.verifyOtp
);

router.post(
  '/resend-otp',
  otpLimiter,
  validateBody(ResendOtpSchema),
  authController.resendOtp
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll
);

export default router;
