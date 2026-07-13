import { axiosInstance } from "./axoisInstance";

export interface LessonProgressData {
  lessonId: string;
  watchedSeconds: number;
  completed: boolean;
  completedPercentage: number;
  lastWatchedAt: string;
}

export interface CourseProgressResponse {
  success: boolean;
  message: string;
  data: {
    lessonProgress: Record<string, LessonProgressData>;
    courseProgress: number;
    lastWatched: any;
  };
}

export interface UpdateVideoProgressData {
  courseId: string;
  lessonId: string;
  currentTime: number;
  completed?: boolean;
}

export interface UpdateVideoProgressResponse {
  success: boolean;
  message: string;
  data: {
    lessonProgress: LessonProgressData;
    courseProgress: number;
  };
}

export interface RecentlyWatchedItem {
  _id: string;
  student: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
  };
  lesson: {
    _id: string;
    title: string;
    durationSeconds: number;
  };
  watchedAt: string;
}

export interface RecentlyWatchedResponse {
  success: boolean;
  message: string;
  data: RecentlyWatchedItem[];
}

export const progressApi = {
  /**
   * Update video playback progress position and completion state
   */
  updateVideoProgress: async (
    data: UpdateVideoProgressData
  ): Promise<UpdateVideoProgressResponse> => {
    const response = await axiosInstance.post("/progress/video", data);
    return response.data;
  },

  /**
   * Fetch course-wide lesson progresses and completion percentage
   */
  getCourseProgress: async (courseId: string): Promise<CourseProgressResponse> => {
    const response = await axiosInstance.get(`/progress/course/${courseId}`);
    return response.data;
  },

  /**
   * Fetch user's list of recently watched lessons
   */
  getRecentlyWatched: async (): Promise<RecentlyWatchedResponse> => {
    const response = await axiosInstance.get("/progress/recent");
    return response.data;
  },
};
