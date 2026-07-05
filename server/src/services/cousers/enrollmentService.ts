
import Course from "../../models/courseModel.js";
import Enrollment from "../../models/enrollmentModel.js";
import type { CreateEnrollmentBody, UpdateEnrollmentBody } from "../../types/courseTypes.js";
import { EnrollmentStatus } from "../../interfaces/courseInterfaces.js";

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
  progressData: { 
    lessonId?: string; 
    moduleId?: string; 
    progress?: number;
    timeSpent?: number;
    currentTime?: number;
    duration?: number;
  },
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

    // Update time spent (accumulate)
    if (progressData.timeSpent && progressData.timeSpent > 0) {
      enrollment.totalTimeSpent = (enrollment.totalTimeSpent || 0) + progressData.timeSpent;
    }

    // Update last accessed time with current timestamp
    enrollment.lastAccessedAt = new Date();

    // Auto-complete if progress is 100%
    if (enrollment.progress === 100 && !enrollment.isCompleted) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
      enrollment.status = EnrollmentStatus.COMPLETED;
    }

    await enrollment.save();
    
    // Populate and return
    return await Enrollment.findById(enrollment._id)
      .populate("course", "title thumbnail")
      .populate("student", "name email");
  } catch (error) {
    throw error;
  }
};

export const updateVideoProgress = async (
  studentId: string,
  courseId: string,
  lessonId: string,
  currentTime: number,
  duration: number,
): Promise<any> => {
  try {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Calculate time spent since last update (throttled to 5 seconds)
    const timeSpent = 5; // 5 seconds per update

    // Update current lesson
    enrollment.currentLesson = lessonId as any;
    
    // Accumulate time spent
    enrollment.totalTimeSpent = (enrollment.totalTimeSpent || 0) + timeSpent;
    
    // Update last accessed time
    enrollment.lastAccessedAt = new Date();

    await enrollment.save();
    
    return {
      success: true,
      totalTimeSpent: enrollment.totalTimeSpent,
      lastAccessedAt: enrollment.lastAccessedAt,
    };
  } catch (error) {
    throw error;
  }
};

export const generateCertificate = async (
  studentId: string,
  courseId: string,
): Promise<any> => {
  try {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    }).populate("course", "title thumbnail").populate("student", "name email");

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    if (!enrollment.isCompleted) {
      throw new Error("Course not completed yet");
    }

    if (enrollment.certificateIssued) {
      return {
        alreadyIssued: true,
        certificateUrl: enrollment.certificateUrl,
        issuedAt: enrollment.certificateIssuedAt,
      };
    }

    // Generate certificate URL (in production, this would generate a PDF)
    const certificateId = `CERT-${Date.now()}-${studentId.slice(-6)}`;
    const certificateUrl = `/api/certificates/${certificateId}`;

    // Update enrollment with certificate info
    enrollment.certificateIssued = true;
    enrollment.certificateUrl = certificateUrl;
    enrollment.certificateIssuedAt = new Date();

    await enrollment.save();

    return {
      success: true,
      certificateId,
      certificateUrl,
      issuedAt: enrollment.certificateIssuedAt,
      course: enrollment.course,
      student: enrollment.student,
      completedAt: enrollment.completedAt,
    };
  } catch (error) {
    throw error;
  }
};
