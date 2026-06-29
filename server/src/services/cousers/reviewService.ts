// ─── Review Services ──────────────────────────────────────────────────────────

import Course from "../../models/courseModel.js";
import Enrollment from "../../models/enrollmentModel.js";
import Review from "../../models/reviewModel.js";
import type { CreateReviewBody } from "../../types/courseTypes.js";

export const createReview = async (
  data: CreateReviewBody,
  studentId: string,
): Promise<any> => {
  try {
    // Verify course exists
    const course = await Course.findById(data.course);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: data.course,
    });

    if (!enrollment) {
      throw new Error("You must be enrolled in this course to review it");
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      student: studentId,
      course: data.course,
    });

    if (existingReview) {
      throw new Error("You have already reviewed this course");
    }

    const review = await Review.create({
      ...data,
      student: studentId,
      isVerified: true,
    });

    return review;
  } catch (error) {
    throw error;
  }
};

export const getReviewsByCourse = async (
  courseId: string,
  page: number = 1,
  limit: number = 10,
): Promise<any> => {
  try {
    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ course: courseId, isApproved: true })
        .populate("student", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ course: courseId, isApproved: true }),
    ]);

    return {
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getReviewById = async (id: string): Promise<any> => {
  try {
    return await Review.findById(id).populate("student", "name avatar");
  } catch (error) {
    throw error;
  }
};

export const updateReview = async (id: string, data: any): Promise<any> => {
  try {
    const review = await Review.findByIdAndUpdate(id, data, { new: true });
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  } catch (error) {
    throw error;
  }
};

export const deleteReview = async (id: string): Promise<void> => {
  try {
    await Review.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};