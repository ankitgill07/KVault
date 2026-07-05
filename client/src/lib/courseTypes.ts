// Course Player Types

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  contentType: 'video' | 'text' | 'markdown' | 'presentation' | 'audio' | 'code' | 'interactive';
  videoUrl?: string;
  videoDuration?: number; // in seconds
  thumbnail?: string;
  isPublished: boolean;
  isFree: boolean;
  isPreview: boolean;
  canDownload: boolean;
  completed?: boolean; // Track completion status
  locked?: boolean; // Track if lesson is locked
}

export interface Module {
  _id: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // in minutes
  isPublished: boolean;
  isFree: boolean;
  totalLessons: number;
  lessons: Lesson[];
}

export interface CourseData {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalLessons: number;
  totalModules: number;
  duration: number; // in minutes
  modules: Module[];
}

export interface EnrollmentData {
  _id: string;
  progress: number;
  completedLessons: string[];
  currentLesson?: string;
  currentModule?: string;
  totalTimeSpent: number;
  lastAccessedAt: string;
  isCompleted: boolean;
}

export interface CoursePlayerProps {
  courseId: string;
  enrollment?: EnrollmentData;
}

export interface VideoPlayerProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onProgress: (currentTime: number, duration: number) => void;
}

export interface CourseSidebarProps {
  course: CourseData;
  currentLessonId: string;
  completedLessons: string[];
  onLessonSelect: (lessonId: string) => void;
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
}