
import { Router } from 'express';

import * as authController from '../controllers/authControler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/vaildateMiddleware.js';
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ResendOtpSchema,
  GoogleLoginSchema,
  RefreshTokenSchema,
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
  '/verify-email',
  otpLimiter,
  validateBody(VerifyEmailSchema),
  authController.verifyEmail
);


router.post(
  '/resend-otp',
  otpLimiter,
  validateBody(ResendOtpSchema),
  authController.resendOtp
);


router.post(
  '/google',
  authLimiter,
  validateBody(GoogleLoginSchema),
  authController.googleLogin
);


router.post(
  '/refresh-token',
  validateBody(RefreshTokenSchema),
  authController.refreshToken
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