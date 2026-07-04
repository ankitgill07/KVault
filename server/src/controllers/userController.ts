import { type Response } from 'express';
import { type AuthenticatedRequest } from '../types/type.js';
import User from '../models/userModel.js';
import { sendSuccess, sendError } from '../utils/responseUtil.js';
import { upload } from '../middleware/uploadMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      profileName,
      bio,
      twitterUrl,
      linkedinUrl,
      websiteUrl,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Update fields if provided
    if (profileName !== undefined) user.profileName = profileName;
    if (bio !== undefined) user.bio = bio;
    if (twitterUrl !== undefined) user.twitterUrl = twitterUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (websiteUrl !== undefined) user.websiteUrl = websiteUrl;

    await user.save();

    sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error) {
    console.error('[updateProfile]', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const uploadProfileImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads', path.basename(user.avatar));
      try {
        const fs = await import('fs');
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update avatar path
    const avatarUrl = `/uploads/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    sendSuccess(res, 'Profile image uploaded successfully', { 
      avatar: avatarUrl 
    });
  } catch (error) {
    console.error('[uploadProfileImage]', error);
    sendError(res, 'Internal server error', 500);
  }
};

export const getAchievements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Import Enrollment model
    const Enrollment = (await import('../models/enrollmentModel.js')).default;
    
    // Get all enrollments for the user
    const enrollments = await Enrollment.find({ student: userId });
    
    const totalCertificates = enrollments.length;
    const completedCertificates = enrollments.filter(e => e.isCompleted).length;
    
    const achievements = enrollments.map(enrollment => ({
      courseId: enrollment.course.toString(),
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      completedAt: enrollment.completedAt,
      certificateIssued: enrollment.certificateIssued,
      certificateUrl: enrollment.certificateUrl,
    }));

    sendSuccess(res, 'Achievements fetched successfully', {
      totalCertificates,
      completedCertificates,
      achievements,
    });
  } catch (error) {
    console.error('[getAchievements]', error);
    sendError(res, 'Internal server error', 500);
  }
};