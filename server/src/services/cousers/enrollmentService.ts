
import Course from "../../models/courseModel.js";
import Enrollment from "../../models/enrollmentModel.js";
import type { CreateEnrollmentBody, UpdateEnrollmentBody } from "../../types/courseTypes.js";

export const createEnrollment = async (
  data: CreateEnrollmentBody,
  studentId: string,
): Promise<any> => {
  try {
    // Verify course exists
    const course = await Course.findById(data.course);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: data.course,
    });

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    }

    const enrollment = await Enrollment.create({
      ...data,
      student: studentId,
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(data.course, {
      $inc: { enrollmentCount: 1 },
    });

    return enrollment;
  } catch (error) {
    throw error;
  }
};

export const getEnrollmentById = async (id: string): Promise<any> => {
  try {
    return await Enrollment.findById(id)
      .populate("course", "title thumbnail")
      .populate("student", "name email");
  } catch (error) {
    throw error;
  }
};

export const getEnrollmentByStudentAndCourse = async (
  studentId: string,
  courseId: string,
): Promise<any> => {
  try {
    return await Enrollment.findOne({ student: studentId, course: courseId })
      .populate("course", "title thumbnail")
      .populate("currentLesson");
  } catch (error) {
    throw error;
  }
};

export const getEnrollmentsByStudent = async (
  studentId: string,
): Promise<any[]> => {
  try {
    return await Enrollment.find({ student: studentId })
      .populate("course", "title thumbnail instructor rating")
      .sort({ lastAccessedAt: -1 });
  } catch (error) {
    throw error;
  }
};

export const updateEnrollment = async (
  id: string,
  data: UpdateEnrollmentBody,
): Promise<any> => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }
    return enrollment;
  } catch (error) {
    throw error;
  }
};

export const updateEnrollmentProgress = async (
  studentId: string,
  courseId: string,
  progressData: { lessonId?: string; moduleId?: string; progress?: number },
): Promise<any> => {
  try {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Update current lesson/module
    if (progressData.lessonId)
      enrollment.currentLesson = progressData.lessonId as any;
    if (progressData.moduleId)
      enrollment.currentModule = progressData.moduleId as any;

    // Update progress
    if (progressData.progress !== undefined) {
      enrollment.progress = progressData.progress;
    }

    enrollment.lastAccessedAt = new Date();

    await enrollment.save();
    return enrollment;
  } catch (error) {
    throw error;
  }
};