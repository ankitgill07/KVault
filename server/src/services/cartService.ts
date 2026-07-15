import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Wishlist from '../models/wishlistModel.js';
import { AppError } from '../utils/appError.js';
import type { ICart } from '../interfaces/cartWishlistInterfaces.js';


const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);


export const getCartByUserId = async (userId: string): Promise<ICart> => {
  let cart = await Cart.findOne({ user: toObjectId(userId) }).populate(
    'items.course',
    'title price discountPrice thumbnailUrl slug'
  );

  if (!cart) {
    cart = await Cart.create({ user: toObjectId(userId), items: [] });
  }

  return cart;
};


export const addToCart = async (
  userId: string,
  courseId: string,
  priceAtAdd = 0
): Promise<ICart> => {
  const objectId = toObjectId(courseId);


  const course = await Course.findById(objectId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if user is already enrolled in this course
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isEnrolled = user.enrolledCourses?.some(
    (enrolledId) => enrolledId.toString() === courseId
  );

  if (isEnrolled) {
    throw new AppError('You have already purchased this course', 400);
  }

  // Mutual exclusivity: remove from wishlist if present
  try {
    const wishlist = await Wishlist.findOne({ user: toObjectId(userId) });
    if (wishlist) {
      const idx = wishlist.items.findIndex(item => item.course.toString() === courseId);
      if (idx !== -1) {
        wishlist.items.splice(idx, 1);
        await wishlist.save();
      }
    }
  } catch (err) {
    console.error('[addToCart] Failed to remove from wishlist:', err);
  }

  let cart = await Cart.findOne({ user: toObjectId(userId) });

  const itemPrice = (course.discountPrice !== undefined && course.discountPrice !== null)
    ? course.discountPrice
    : (course.price || 0);

  if (!cart) {
    cart = await Cart.create({
      user: toObjectId(userId),
      items: [
        {
          course: objectId,
          priceAtAdd: itemPrice,
          addedAt: new Date(),
        },
      ],
    });
    return cart;
  }

  const exists = cart.items.some(
    (item) => item.course.toString() === courseId
  );

  if (exists) {
    throw new AppError('Course is already in your cart', 400);
  }

  cart.items.push({
    course: objectId,
    priceAtAdd: itemPrice,
    addedAt: new Date(),
  });

  await cart.save();
  return cart;
};


export const removeFromCart = async (
  userId: string,
  courseId: string
): Promise<ICart | null> => {
  const cart = await Cart.findOne({ user: toObjectId(userId) });

  if (!cart) return null;

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.course.toString() !== courseId
  );

  if (cart.items.length === initialLength) {
    return null; // item was not in cart
  }

  await cart.save();
  return cart;
};


export const clearCart = async (userId: string): Promise<void> => {
  await Cart.findOneAndUpdate(
    { user: toObjectId(userId) },
    { $set: { items: [] } },
    { returnDocument: 'after' }
  );
};

// ─── 5. Checkout ─────────────────────────────────────────────────────────────

export const checkout = async (
  userId: string
): Promise<{ enrolledCourses: string[]; courseProgress: Record<string, any>; cart: any }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const cart = await Cart.findOne({ user: toObjectId(userId) }).populate(
    'items.course'
  );

  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  const enrolled = new Set(user.enrolledCourses || []);
  const progressMap = user.courseProgress || new Map();

  for (const item of cart.items) {
    const courseId = item.course instanceof mongoose.Types.ObjectId
      ? item.course.toString()
      : (item.course as any)._id?.toString() || item.course.toString();

    enrolled.add(courseId);

    if (!progressMap.has(courseId)) {
      progressMap.set(courseId, {
        progress: 0,
        lastAccessed: '',
        completedLessons: [],
      });
    }
  }

  user.enrolledCourses = Array.from(enrolled);
  user.courseProgress = progressMap;
  user.markModified('courseProgress');
  await user.save();

  await Cart.findOneAndDelete({ user: toObjectId(userId) });

  return {
    enrolledCourses: user.enrolledCourses,
    courseProgress: Object.fromEntries(user.courseProgress),
    cart: null,
  };
};
