import { courseApis } from "../api/courseApi";

// ─── Category Service ─────────────────────────────────────────────────────────

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await courseApis.categories.getAllCategories();
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const response = await courseApis.categories.getCategoryById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },
};

// ─── Course Service ───────────────────────────────────────────────────────────

export const courseService = {
  getAllCourses: async (params?: any) => {
    try {
      const response = await courseApis.courses.getAllCourses(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  getFeaturedCourses: async (limit: number = 10) => {
    try {
      const response = await courseApis.courses.getFeaturedCourses(limit);
      return response.data;
    } catch (error) {
      console.error("Error fetching featured courses:", error);
      throw error;
    }
  },

  getTopRatedCourses: async (limit: number = 10) => {
    try {
      const response = await courseApis.courses.getTopRatedCourses(limit);
      return response.data;
    } catch (error) {
      console.error("Error fetching top rated courses:", error);
      throw error;
    }
  },

  getMyCourses: async () => {
    try {
      const response = await courseApis.courses.getMyCourses();
      return response.data;
    } catch (error) {
      console.error("Error fetching my courses:", error);
      throw error;
    }
  },

  getCourseById: async (id: string) => {
    try {
      const response = await courseApis.courses.getCourseById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  getCourseBySlug: async (slug: string) => {
    try {
      const response = await courseApis.courses.getCourseBySlug(slug);
      return response.data;
    } catch (error) {
      console.error("Error fetching course by slug:", error);
      throw error;
    }
  },

  createCourse: async (data: any) => {
    try {
      const response = await courseApis.courses.createCourse(data);
      return response.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  updateCourse: async (id: string, data: any) => {
    try {
      const response = await courseApis.courses.updateCourse(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  deleteCourse: async (id: string) => {
    try {
      const response = await courseApis.courses.deleteCourse(id);
      return response.data;
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },
};

// ─── Module Service ───────────────────────────────────────────────────────────

export const moduleService = {
  getModulesByCourse: async (courseId: string) => {
    try {
      const response = await courseApis.modules.getModulesByCourse(courseId);
      return response.data;
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw error;
    }
  },

  getModuleById: async (id: string) => {
    try {
      const response = await courseApis.modules.getModuleById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching module:", error);
      throw error;
    }
  },

  createModule: async (data: any) => {
    try {
      const response = await courseApis.modules.createModule(data);
      return response.data;
    } catch (error) {
      console.error("Error creating module:", error);
      throw error;
    }
  },

  updateModule: async (id: string, data: any) => {
    try {
      const response = await courseApis.modules.updateModule(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating module:", error);
      throw error;
    }
  },

  deleteModule: async (id: string) => {
    try {
      const response = await courseApis.modules.deleteModule(id);
      return response.data;
    } catch (error) {
      console.error("Error deleting module:", error);
      throw error;
    }
  },
};

// ─── Lesson Service ───────────────────────────────────────────────────────────

export const lessonService = {
  getLessonsByModule: async (moduleId: string) => {
    try {
      const response = await courseApis.lessons.getLessonsByModule(moduleId);
      return response.data;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
  },

  getLessonById: async (id: string) => {
    try {
      const response = await courseApis.lessons.getLessonById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      throw error;
    }
  },

  createLesson: async (data: any) => {
    try {
      const response = await courseApis.lessons.createLesson(data);
      return response.data;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  },

  updateLesson: async (id: string, data: any) => {
    try {
      const response = await courseApis.lessons.updateLesson(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
  },

  deleteLesson: async (id: string) => {
    try {
      const response = await courseApis.lessons.deleteLesson(id);
      return response.data;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  },
};

// ─── Enrollment Service ───────────────────────────────────────────────────────

export const enrollmentService = {
  enrollInCourse: async (data: any) => {
    try {
      const response = await courseApis.enrollments.enrollInCourse(data);
      return response.data;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      throw error;
    }
  },

  getMyEnrollments: async () => {
    try {
      const response = await courseApis.enrollments.getMyEnrollments();
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw error;
    }
  },

  getEnrollmentById: async (id: string) => {
    try {
      const response = await courseApis.enrollments.getEnrollmentById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      throw error;
    }
  },

  updateEnrollment: async (id: string, data: any) => {
    try {
      const response = await courseApis.enrollments.updateEnrollment(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating enrollment:", error);
      throw error;
    }
  },

  updateProgress: async (data: any) => {
    try {
      const response = await courseApis.enrollments.updateProgress(data);
      return response.data;
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  },
};

// ─── Review Service ───────────────────────────────────────────────────────────

export const reviewService = {
  getReviewsByCourse: async (courseId: string, page: number = 1, limit: number = 10) => {
    try {
      const response = await courseApis.reviews.getReviewsByCourse(courseId, page, limit);
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  getReviewById: async (id: string) => {
    try {
      const response = await courseApis.reviews.getReviewById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching review:", error);
      throw error;
    }
  },

  createReview: async (data: any) => {
    try {
      const response = await courseApis.reviews.createReview(data);
      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  updateReview: async (id: string, data: any) => {
    try {
      const response = await courseApis.reviews.updateReview(id, data);
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  deleteReview: async (id: string) => {
    try {
      const response = await courseApis.reviews.deleteReview(id);
      return response.data;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};