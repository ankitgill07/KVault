import { type Response } from 'express';
import { type AuthenticatedRequest } from '../types/type.js';
import User from '../models/userModel.js';
import { sendSuccess, sendError } from '../utils/responseUtil.js';

// Get current user profile (including cart, wishlist, enrolledCourses, courseProgress)
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

// Toggle item in Cart
export const toggleCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.body;
    if (!courseId) {
      sendError(res, 'Course ID is required', 400);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const cart = user.cart || [];
    const index = cart.indexOf(courseId);
    if (index > -1) {
      cart.splice(index, 1); // remove
    } else {
      cart.push(courseId); // add
    }

    user.cart = cart;
    await user.save();

    sendSuccess(res, 'Cart updated successfully', { cart: user.cart });
  } catch (error) {
    console.error('[toggleCart]', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Toggle item in Wishlist
export const toggleWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.body;
    if (!courseId) {
      sendError(res, 'Course ID is required', 400);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const wishlist = user.wishlist || [];
    const index = wishlist.indexOf(courseId);
    if (index > -1) {
      wishlist.splice(index, 1); // remove
    } else {
      wishlist.push(courseId); // add
    }

    user.wishlist = wishlist;
    await user.save();

    sendSuccess(res, 'Wishlist updated successfully', { wishlist: user.wishlist });
  } catch (error) {
    console.error('[toggleWishlist]', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Checkout & enroll in courses inside the Cart
export const purchaseCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const cart = user.cart || [];
    if (cart.length === 0) {
      sendError(res, 'Cart is empty', 400);
      return;
    }

    const enrolled = user.enrolledCourses || [];
    const progress = user.courseProgress || new Map();

    cart.forEach(courseId => {
      if (!enrolled.includes(courseId)) {
        enrolled.push(courseId);
      }
      // Initialize course progress if not existing
      if (!progress.has(courseId)) {
        progress.set(courseId, {
          progress: 0,
          lastAccessed: '',
          completedLessons: []
        });
      }
    });

    user.enrolledCourses = enrolled;
    user.courseProgress = progress;
    user.cart = []; // clear cart after purchase

    await user.save();

    sendSuccess(res, 'Courses purchased successfully', {
      enrolledCourses: user.enrolledCourses,
      courseProgress: Object.fromEntries(user.courseProgress),
      cart: user.cart
    });
  } catch (error) {
    console.error('[purchaseCart]', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Update lesson progress for a course
export const updateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId, progressVal, lastAccessed, completedLessons } = req.body;

    if (!courseId) {
      sendError(res, 'Course ID is required', 400);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const progressMap = user.courseProgress || new Map();
    const currentProgress = progressMap.get(courseId) || {
      progress: 0,
      lastAccessed: '',
      completedLessons: []
    };

    if (progressVal !== undefined) currentProgress.progress = progressVal;
    if (lastAccessed !== undefined) currentProgress.lastAccessed = lastAccessed;
    if (completedLessons !== undefined) currentProgress.completedLessons = completedLessons;

    progressMap.set(courseId, currentProgress);
    user.courseProgress = progressMap;

    // Ensure it's enrolled
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
    }

    // Force Mongoose to register the map change
    user.markModified('courseProgress');
    await user.save();

    sendSuccess(res, 'Course progress updated successfully', {
      courseProgress: Object.fromEntries(user.courseProgress)
    });
  } catch (error) {
    console.error('[updateProgress]', error);
    sendError(res, 'Internal server error', 500);
  }
};
