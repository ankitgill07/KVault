// ─── Course Services ──────────────────────────────────────────────────────────

import mongoose from "mongoose";
import Course from "../../models/courseModel.js";
import type {
  CourseListResponse,
  CourseQueryParams,
  CourseResponse,
  CreateCourseBody,
  UpdateCourseBody,
} from "../../types/courseTypes.js";
import Category from "../../models/categoryModel.js";
import Module from "../../models/moduleModel.js";
import Lesson from "../../models/lessonModel.js";
import Enrollment from "../../models/enrollmentModel.js";
import Review from "../../models/reviewModel.js";
import { uploadThumbnail, deleteThumbnail, r2UploadPresignedUrl, deleteFileFromR2, deleteFolderFromR2 } from "../../services/video/cloudflareR2Service.js";

export const createCourse = async (
  data: CreateCourseBody,
  instructorId: string,
): Promise<any> => {
  // Validate ObjectId format first
  if (!mongoose.Types.ObjectId.isValid(data.category)) {
    throw new Error("Invalid category ID format");
  }
  console.log("Category ID received:", data.category);
  console.log(
    "Is valid ObjectId:",
    mongoose.Types.ObjectId.isValid(data.category),
  );
  const category = await Category.findById(data.category);
  if (!category) {
    throw new Error("Category not found");
  }

  // Parse thumbnail info if present
  if (data.thumbnailUrl) {
    const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://pub-121dca38669f707d1ba67a1b1b19ca9b.r2.dev";
    if (data.thumbnailUrl.includes("r2.dev") || data.thumbnailUrl.includes(r2PublicUrl)) {
      try {
        const urlObj = new URL(data.thumbnailUrl);
        (data as any).thumbnailKey = urlObj.pathname.substring(1);
      } catch (e) {
        console.error("[createCourse] failed to parse thumbnail URL:", e);
      }
    }
  }

  const course = await Course.create({
    ...data,
    primaryInstructor: instructorId,
  });

  return course;
};

export const getAllCourses = async (
  query: CourseQueryParams,
  userId?: string,
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

    // Filter out draft courses with isPublished=false from public view
    // unless the user is the instructor who created the course
    if (userId) {
      // If user is authenticated, show:
      // 1. All their own courses (including drafts) OR
      // 2. Published courses from others that are not in draft status
      filter.$or = [
        { primaryInstructor: userId },
        { 
          isPublished: true,
          status: { $ne: "draft" }
        }
      ];
    } else {
      // If user is not authenticated, only show published non-draft courses
      filter.isPublished = true;
      filter.status = { $ne: "draft" };
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
        .populate("primaryInstructor", "name email avatar")
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

export const getCourseById = async (id: string, userId?: string): Promise<any> => {
  try {
    const course = await Course.findById(id)
      .populate("category", "name slug description")
      .populate("primaryInstructor", "name email avatar bio")


    if (!course) {
      throw new Error("Course not found");
    }

    // Check if course is unpublished and user is not the instructor
    // if (!course.isPublished && course.primaryInstructor._id?.toString() !== userId) {
    //   throw new Error("Course not found");
    // }

    // Increment view count
    await Course.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return course;
  } catch (error) {
    throw error;
  }
};

export const getCourseBySlug = async (slug: string, userId?: string): Promise<any> => {
  try {
    const course = await Course.findOne({ slug })
      .populate("category", "name slug description")
      .populate("primaryInstructor", "name email avatar bio")


    if (!course) {
      throw new Error("Course not found");
    }

    // Check if course is unpublished and user is not the instructor
    if (!course.isPublished && course.primaryInstructor._id?.toString() !== userId) {
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
    // Parse thumbnail info if present
    if (data.thumbnailUrl) {
      const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://pub-121dca38669f707d1ba67a1b1b19ca9b.r2.dev";
      if (data.thumbnailUrl.includes("r2.dev") || data.thumbnailUrl.includes(r2PublicUrl)) {
        try {
          const urlObj = new URL(data.thumbnailUrl);
          (data as any).thumbnailKey = urlObj.pathname.substring(1);
        } catch (e) {
          console.error("[updateCourse] failed to parse thumbnail URL:", e);
        }
      }
    }

    const course = await Course.findByIdAndUpdate(id, data, { returnDocument: "after" });
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

    // Delete course thumbnail from R2
    if (course.thumbnailKey) {
      await deleteFileFromR2(course.thumbnailKey);
    }

    // Delete preview video and HLS folder from R2
    if ((course as any).previewVideoKey) {
      await deleteFileFromR2((course as any).previewVideoKey);
    }
    await deleteFolderFromR2(`processed/previews/${id}`);

    // Delete all lesson videos and HLS folders from R2
    const modules = await Module.find({ course: id });
    for (const module of modules) {
      const lessons = await Lesson.find({ module: module._id });
      for (const lesson of lessons) {
        if (lesson.videoKey) {
          await deleteFileFromR2(lesson.videoKey);
        }
        await deleteFolderFromR2(`processed/lectures/${lesson._id}`);
      }
    }

    // Delete all modules and their lessons from database
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
    // Return ALL courses created by the instructor
    // Instructors should see all their courses (draft, published, etc.) in "My Courses"
    return await Course.find({ primaryInstructor: instructorId })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

export const uploadCourseThumbnail = async (
  courseId: string,
  file: Express.Multer.File,
): Promise<any> => {
  try {
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Delete old thumbnail if exists
    if (course.thumbnailKey) {
      try {
        await deleteThumbnail(course.thumbnailKey);
      } catch (error) {
        console.error("[uploadCourseThumbnail] Error deleting old thumbnail:", error);
        // Continue with upload even if delete fails
      }
    }

    // Upload new thumbnail
    const uploadResult = await uploadThumbnail(file, courseId);

    // Update course with new thumbnail info
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        thumbnailUrl: uploadResult.url,
        thumbnailKey: uploadResult.key,
      },
      { returnDocument: "after" }
    );

    return updatedCourse;
  } catch (error) {
    throw error;
  }
};

export const generateUploadPresignedUrl = async (
  type: 'thumbnail' | 'video' | 'resource',
  fileName: string,
  fileType: string,
  instructorId: string,
): Promise<{ url: string; key: string; publicUrl: string }> => {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${type}/${instructorId}/${timestamp}-${randomString}.${fileExtension}`;

    // Generate presigned URL
    const presignedUrl = await r2UploadPresignedUrl(uniqueFileName, fileType);

    // Construct the public URL using R2 bucket configuration
    const r2PublicUrl = process.env.R2_PUBLIC_URL;
    const publicUrl = `${r2PublicUrl}/${uniqueFileName}`;

    return {
      url: presignedUrl,
      key: uniqueFileName,
      publicUrl,
    };
  } catch (error) {
    console.error("[generateUploadPresignedUrl] Error generating presigned URL:", error);
    throw new Error("Failed to generate upload URL: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};
