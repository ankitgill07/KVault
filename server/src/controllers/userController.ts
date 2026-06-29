import { type Response } from 'express';
import { type AuthenticatedRequest } from '../types/type.js';
import User from '../models/userModel.js';
import { sendSuccess, sendError } from '../utils/responseUtil.js';




export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, 'Profile fetched successfully', { user });
  } catch (error) {
    console.error('[getProfile]', error);
    sendError(res, 'Internal server error', 500);
  }
};

