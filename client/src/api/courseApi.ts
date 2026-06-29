import { axiosInstance } from "./axoisInstance";

// ─── Category API ─────────────────────────────────────────────────────────────

export const categoryApi = {
  // Get all categories
  getAllCategories: async () => {
    const response = await axiosInstance.get("/courses/categories");
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string) => {
    const response = await axiosInstance.get(`/courses/categories/${id}`);
    return response.data;
  },

  // Create category (Admin only)
  createCategory: async (data: {
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    parentCategory?: string;
  }) => {
    const response = await axiosInstance.post("/courses/categories", data);
    return response.data;
  },

  // Update category (Admin only)
  updateCategory: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/courses/categories/${id}`, data);
    return response.data;
  },

  // Delete category (Admin only)
  deleteCategory: async (id: string) => {
    const response = await axiosInstance.delete(`/courses/categories/${id}`);
    return response.data;
  },
};

// ─── Course API ───────────────────────────────────────────────────────────────

export const courseApi = {
  // Get all courses with filters
  getAllCourses: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    language?: string;
    isPublished?: boolean;
    featured?: boolean;
    search?: string;
    tags?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await axiosInstance.get("/courses", { params });
    return response.data;
  },

  // Get featured courses
  getFeaturedCourses: async (limit: number = 10) => {
    const response = await axiosInstance.get("/courses/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Get top rated courses
  getTopRatedCourses: async (limit: number = 10) => {
    const response = await axiosInstance.get("/courses/top-rated", {
      params: { limit },
    });
    return response.data;
  },

  // Get my courses (Instructor)
  getMyCourses: async () => {
    const response = await axiosInstance.get("/courses/my-courses");
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id: string) => {
    const response = await axiosInstance.get(`/courses/${id}`);
    return response.data;
  },

  // Get course by slug
  getCourseBySlug: async (slug: string) => {
    const response = await axiosInstance.get(`/courses/slug/${slug}`);
    return response.data;
  },

  // Create course (Instructor/Admin)
  createCourse: async (data: any) => {
    const response = await axiosInstance.post("/courses", data);
    return response.data;
  },

  // Update course
  updateCourse: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/courses/${id}`, data);
    return response.data;
  },

  // Delete course
  deleteCourse: async (id: string) => {
    const response = await axiosInstance.delete(`/courses/${id}`);
    return response.data;
  },
};

// ─── Module API ───────────────────────────────────────────────────────────────

export const moduleApi = {
  // Get modules by course
  getModulesByCourse: async (courseId: string) => {
    const response = await axiosInstance.get(`/courses/module/${courseId}/modules`);
    return response.data;
  },

  // Get module by ID
  getModuleById: async (id: string) => {
    const response = await axiosInstance.get(`/courses/modules/${id}`);
    return response.data;
  },

  // Create module
  createModule: async (data: {
    course: string;
    title: string;
    description?: string;
    order: number;
    duration: number;
    isPublished?: boolean;
    isFree?: boolean;
  }) => {
    const response = await axiosInstance.post("/courses/modules", data);
    return response.data;
  },

  // Update module
  updateModule: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/courses/modules/${id}`, data);
    return response.data;
  },

  // Delete module
  deleteModule: async (id: string) => {
    const response = await axiosInstance.delete(`/courses/modules/${id}`);
    return response.data;
  },
};

// ─── Lesson ───────────────────────────────────────────────────────────────

export const lessonApi = {
  // Get lessons by module
  getLessonsByModule: async (moduleId: string) => {
    const response = await axiosInstance.get(
      `/courses/lesson/${moduleId}/lessons`,
    );
    return response.data;
  },

  // Get lesson by ID
  getLessonById: async (id: string) => {
    const response = await axiosInstance.get(`/courses/lessons/${id}`);
    return response.data;
  },

  // Create lesson
  createLesson: async (data: any) => {
    const response = await axiosInstance.post("/courses/lessons", data);
    return response.data;
  },

  // Update lesson
  updateLesson: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/courses/lessons/${id}`, data);
    return response.data;
  },

  // Delete lesson
  deleteLesson: async (id: string) => {
    const response = await axiosInstance.delete(`/courses/lessons/${id}`);
    return response.data;
  },
};

// ─── Enrollment API ───────────────────────────────────────────────────────────

export const enrollmentApi = {
  // Enroll in course
  enrollInCourse: async (data: {
    course: string;
    amountPaid: number;
    paymentMethod?: string;
    transactionId?: string;
  }) => {
    const response = await axiosInstance.post("/courses/enrollments", data);
    return response.data;
  },

  // Get my enrollments
  getMyEnrollments: async () => {
    const response = await axiosInstance.get(
      "/courses/enrollments/my-enrollments",
    );
    return response.data;
  },

  // Get enrollment by ID
  getEnrollmentById: async (id: string) => {
    const response = await axiosInstance.get(`/courses/enrollments/${id}`);
    return response.data;
  },

  // Update enrollment
  updateEnrollment: async (id: string, data: any) => {
    const response = await axiosInstance.put(
      `/courses/enrollments/${id}`,
      data,
    );
    return response.data;
  },

  // Update progress
  updateProgress: async (data: {
    courseId: string;
    lessonId?: string;
    moduleId?: string;
    progress?: number;
  }) => {
    const response = await axiosInstance.post(
      "/courses/enrollments/progress",
      data,
    );
    return response.data;
  },
};

// ─── Review API ───────────────────────────────────────────────────────────────

export const reviewApi = {
  // Get reviews by course
  getReviewsByCourse: async (
    courseId: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    const response = await axiosInstance.get(`/courses/${courseId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get review by ID
  getReviewById: async (id: string) => {
    const response = await axiosInstance.get(`/courses/reviews/${id}`);
    return response.data;
  },

  // Create review
  createReview: async (data: {
    course: string;
    rating: number;
    title?: string;
    comment?: string;
    pros?: string[];
    cons?: string[];
  }) => {
    const response = await axiosInstance.post("/courses/reviews", data);
    return response.data;
  },

  // Update review
  updateReview: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/courses/reviews/${id}`, data);
    return response.data;
  },

  // Delete review
  deleteReview: async (id: string) => {
    const response = await axiosInstance.delete(`/courses/reviews/${id}`);
    return response.data;
  },
};

// ─── Export all APIs ──────────────────────────────────────────────────────────

export const courseApis = {
  categories: categoryApi,
  courses: courseApi,
  modules: moduleApi,
  lessons: lessonApi,
  enrollments: enrollmentApi,
  reviews: reviewApi,
};
