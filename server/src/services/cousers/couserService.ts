// ─── Course Services ──────────────────────────────────────────────────────────

import mongoose from "mongoose";
import Course from "../../models/courseModel.js";
import type { CourseListResponse, CourseQueryParams, CourseResponse, CreateCourseBody, UpdateCourseBody } from "../../types/courseTypes.js";
import Category from "../../models/categoryModel.js";
import Module from "../../models/moduleModel.js";
import Lesson from "../../models/lessonModel.js";
import Enrollment from "../../models/enrollmentModel.js";
import Review from "../../models/reviewModel.js";

export const createCourse = async (
  data: CreateCourseBody,
  instructorId: string,
): Promise<any> => {
  // Validate ObjectId format first
  if (!mongoose.Types.ObjectId.isValid(data.category)) {
    throw new Error("Invalid category ID format");
  }
console.log("Category ID received:", data.category);
console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(data.category));
  const category = await Category.findById(data.category);
  if (!category) {
    throw new Error("Category not found");
  }

  const course = await Course.create({
    ...data,
    primaryInstructor: instructorId,
    instructors: [instructorId],
  });

  return course;
};

export const getAllCourses = async (
  query: CourseQueryParams,
): Promise<CourseListResponse> => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      language,
      isPublished,
      featured,
      search,
      tags,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    // Build filter
    const filter: any = {};

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (language) filter.language = language;
    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (featured !== undefined) filter.featured = featured;
    if (tags) filter.tags = { $in: tags.split(",") };
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [courses, totalCourses] = await Promise.all([
      Course.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .populate("primaryInstructor", "name email")
        .populate("instructors", "name")
        .lean<CourseResponse[]>(), 
      Course.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCourses / limit);

    return {
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getCourseById = async (id: string): Promise<any> => {
  try {
    const course = await Course.findById(id)
      .populate("category", "name slug description")
      .populate("primaryInstructor", "name email avatar bio")
      .populate("instructors", "name email avatar")
      .populate("prerequisites", "title slug thumbnail");

    if (!course) {
      throw new Error("Course not found");
    }

    // Increment view count
    await Course.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return course;
  } catch (error) {
    throw error;
  }
};

export const getCourseBySlug = async (slug: string): Promise<any> => {
  try {
    const course = await Course.findOne({ slug })
      .populate("category", "name slug description")
      .populate("primaryInstructor", "name email avatar bio")
      .populate("instructors", "name email avatar")
      .populate("prerequisites", "title slug thumbnail");

    if (!course) {
      throw new Error("Course not found");
    }

    // Increment view count
    await Course.findByIdAndUpdate(course._id, { $inc: { viewCount: 1 } });

    return course;
  } catch (error) {
    throw error;
  }
};

export const updateCourse = async (
  id: string,
  data: UpdateCourseBody,
): Promise<any> => {
  try {
    const course = await Course.findByIdAndUpdate(id, data, { new: true });
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = async (id: string): Promise<void> => {
  try {
    const course = await Course.findById(id);
    if (!course) {
      throw new Error("Course not found");
    }

    // Delete all modules and their lessons
    const modules = await Module.find({ course: id });
    for (const module of modules) {
      await Lesson.deleteMany({ module: module._id });
    }
    await Module.deleteMany({ course: id });

    // Delete enrollments and reviews
    await Enrollment.deleteMany({ course: id });
    await Review.deleteMany({ course: id });

    // Delete course
    await Course.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

export const getFeaturedCourses = async (
  limit: number = 10,
): Promise<any[]> => {
  try {
    return await Course.find({ isPublished: true, featured: true })
      .sort({ rating: -1, enrollmentCount: -1 })
      .limit(limit)
      .populate("category", "name slug")
      .populate("primaryInstructor", "name");
  } catch (error) {
    throw error;
  }
};

export const getTopRatedCourses = async (
  limit: number = 10,
): Promise<any[]> => {
  try {
    return await Course.find({ isPublished: true, rating: { $gte: 4 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .populate("category", "name slug")
      .populate("primaryInstructor", "name");
  } catch (error) {
    throw error;
  }
};

export const getCoursesByInstructor = async (
  instructorId: string,
): Promise<any[]> => {
  try {
    return await Course.find({ primaryInstructor: instructorId })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};
