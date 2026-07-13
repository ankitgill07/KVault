import type { IUser } from "../interfaces/interfaces.js";
import {
  CourseLevel,
  CourseStatus,
  LessonContentType,
} from "../interfaces/courseInterfaces.js";

// ─── Category Types ───────────────────────────────────────────────────────────

export interface CreateCategoryBody {
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: string;
  subcategories: string[];
  isActive: boolean;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Course Types ─────────────────────────────────────────────────────────────

export interface CreateCourseBody {
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  shortDescription?: string;
  category: string;
  tags?: string[];
  level: CourseLevel;
  language?: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  previewVideo?: string;
  images?: string[];
  primaryInstructor: string;
  requirements?: string[];
  learningOutcomes?: string[];
  targetAudience?: string[];
  duration: number;
  price: number;
  discountPrice?: number;
  currency?: string;
  isFree?: boolean;
  certificateEnabled?: boolean;
  lifetimeAccess?: boolean;
  prerequisites?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateCourseBody {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  tags?: string[];
  level?: CourseLevel;
  language?: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  previewVideo?: string;
  images?: string[];
  primaryInstructor?: string;
  requirements?: string[];
  learningOutcomes?: string[];
  targetAudience?: string[];
  duration?: number;
  price?: number;
  discountPrice?: number;
  currency?: string;
  isFree?: boolean;
  status?: CourseStatus;
  isPublished?: boolean;
  featured?: boolean;
  certificateEnabled?: boolean;
  lifetimeAccess?: boolean;
  prerequisites?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: CourseLevel;
  language?: string;
  isPublished?: boolean;
  featured?: boolean;
  search?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "rating" | "enrollmentCount" | "price";
  sortOrder?: "asc" | "desc";
}

export interface CourseResponse {
  _id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  shortDescription?: string;
  category: string | CategoryResponse;
  tags: string[];
  level: CourseLevel;
  language: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  previewVideo?: string;
  images: string[];
  primaryInstructor: string | IUser;
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  duration: number;
  totalLessons: number;
  totalModules: number;
  price: number;
  discountPrice?: number;
  currency: string;
  isFree: boolean;
  status: CourseStatus;
  isPublished: boolean;
  publishedAt?: string;
  featured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  certificateEnabled: boolean;
  lifetimeAccess: boolean;
  prerequisites?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseListResponse {
  courses: CourseResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Module Types ─────────────────────────────────────────────────────────────

export interface CreateModuleBody {
  course: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  isPublished?: boolean;
  isFree?: boolean;
}

export interface UpdateModuleBody {
  title?: string;
  description?: string;
  order?: number;
  duration?: number;
  isPublished?: boolean;
  isFree?: boolean;
}

export interface ModuleResponse {
  _id: string;
  course: string;
  title: string;
  description?: string;
  order: number;
  duration: number;
  isPublished: boolean;
  isFree: boolean;
  totalLessons: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Lesson Types ─────────────────────────────────────────────────────────────

export interface CreateLessonBody {
  module: string;
  course: string;
  title: string;
  description?: string;
  order: number;
  contentType: LessonContentType;
  durationSeconds: number;
  videoUrl?: string;
  videoKey?: string;
  videoStatus?: "pending" | "processing" | "ready" | "failed";
  videoProvider?: "youtube" | "vimeo" | "custom" | "aws_s3";
  textContent?: string;
  markdownContent?: string;
  resources?: string[];
  quiz?: string;
  isPublished?: boolean;
  isFree?: boolean;
  isPreview?: boolean;
  canDownload?: boolean;
}

export interface UpdateLessonBody {
  title?: string;
  description?: string;
  order?: number;
  contentType?:
    | "video"
    | "text"
    | "markdown"
    | "presentation"
    | "audio"
    | "code"
    | "interactive"
    | "pdf"
    | "article"
    | "link"
    | "quiz"
    | "assignment";
  videoUrl?: string;
  videoKey?: string;
  videoStatus?: "pending" | "processing" | "ready" | "failed";
  durationSeconds?: number;
  videoProvider?: "youtube" | "vimeo" | "custom" | "aws_s3";
  textContent?: string;
  markdownContent?: string;
  resources?: string[];
  quiz?: string;
  isPublished?: boolean;
  isFree?: boolean;
  isPreview?: boolean;
  canDownload?: boolean;
}

export interface LessonResponse {
  _id: string;
  module: string;
  course: string;
  title: string;
  description?: string;
  order: number;
  contentType: string;
  videoUrl?: string;
  videoProvider?: string;
  textContent?: string;
  markdownContent?: string;
  resources: string[];
  quiz?: string;
  durationSeconds: number;
  isPublished: boolean;
  isFree: boolean;
  isPreview: boolean;
  canDownload: boolean;
  viewCount: number;
  completionCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Resource Types ───────────────────────────────────────────────────────────

export interface CreateResourceBody {
  lesson: string;
  title: string;
  description?: string;
  type:
    | "pdf"
    | "document"
    | "spreadsheet"
    | "presentation"
    | "image"
    | "audio"
    | "video"
    | "code_file"
    | "archive"
    | "link";
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  isDownloadable?: boolean;
}

export interface UpdateResourceBody {
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isDownloadable?: boolean;
}

export interface ResourceResponse {
  _id: string;
  lesson: string;
  title: string;
  description?: string;
  type: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  isDownloadable: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Enrollment Types ─────────────────────────────────────────────────────────

export interface CreateEnrollmentBody {
  course: string;
  amountPaid: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface UpdateEnrollmentBody {
  progress?: number;
  completedLessons?: string[];
  completedModules?: string[];
  currentLesson?: string;
  currentModule?: string;
  totalTimeSpent?: number;
  status?: "active" | "completed" | "dropped" | "paused" | "expired";
}

export interface EnrollmentResponse {
  _id: string;
  student: string | IUser;
  course: string | CourseResponse;
  progress: number;
  completedLessons: string[];
  completedModules: string[];
  currentLesson?: string;
  currentModule?: string;
  totalTimeSpent: number;
  lastAccessedAt: string;
  completedAt?: string;
  status: string;
  isCompleted: boolean;
  certificateIssued: boolean;
  certificateUrl?: string;
  certificateIssuedAt?: string;
  amountPaid: number;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface CreateReviewBody {
  course: string;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

export interface UpdateReviewBody {
  rating?: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  isApproved?: boolean;
  isFeatured?: boolean;
  instructorResponse?: string;
}

export interface ReviewResponse {
  _id: string;
  course: string;
  student: string | IUser;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  helpfulCount: number;
  reportCount: number;
  isVerified: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  instructorResponse?: string;
  instructorRespondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quiz Types ───────────────────────────────────────────────────────────────

export interface CreateQuizBody {
  lesson: string;
  course: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  showResultsImmediately?: boolean;
  questions: string[];
}

export interface UpdateQuizBody {
  title?: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  showResultsImmediately?: boolean;
  questions?: string[];
  isPublished?: boolean;
}

export interface QuizResponse {
  _id: string;
  lesson: string;
  course: string;
  title: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  showResultsImmediately: boolean;
  questions: string[];
  totalQuestions: number;
  totalPoints: number;
  attemptCount: number;
  averageScore: number;
  passRate: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Question Types ───────────────────────────────────────────────────────────

export interface CreateQuestionBody {
  quiz: string;
  questionText: string;
  questionType:
    | "mcq_single"
    | "mcq_multiple"
    | "true_false"
    | "fill_blank"
    | "essay"
    | "code"
    | "matching";
  points?: number;
  order: number;
  image?: string;
  audio?: string;
  options: string[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  isRequired?: boolean;
}

export interface UpdateQuestionBody {
  questionText?: string;
  questionType?: string;
  points?: number;
  order?: number;
  image?: string;
  audio?: string;
  options?: string[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  isRequired?: boolean;
}

export interface QuestionResponse {
  _id: string;
  quiz: string;
  questionText: string;
  questionType: string;
  points: number;
  order: number;
  image?: string;
  audio?: string;
  options: string[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Option Types ─────────────────────────────────────────────────────────────

export interface CreateOptionBody {
  question: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
  explanation?: string;
}

export interface UpdateOptionBody {
  optionText?: string;
  isCorrect?: boolean;
  order?: number;
  explanation?: string;
}

export interface OptionResponse {
  _id: string;
  question: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quiz Attempt Types ───────────────────────────────────────────────────────

export interface CreateQuizAttemptBody {
  quiz: string;
  course: string;
}

export interface SubmitQuizAttemptBody {
  answers: Array<{
    question: string;
    selectedOption?: string;
    selectedOptions?: string[];
    textAnswer?: string;
  }>;
}

export interface QuizAttemptResponse {
  _id: string;
  quiz: string;
  student: string | IUser;
  course: string;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  answers: string[];
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  reviewedAnswers: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Answer Types ─────────────────────────────────────────────────────────────

export interface CreateAnswerBody {
  quizAttempt: string;
  question: string;
  selectedOption?: string;
  selectedOptions?: string[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  feedback?: string;
}

export interface UpdateAnswerBody {
  selectedOption?: string;
  selectedOptions?: string[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  feedback?: string;
}

export interface AnswerResponse {
  _id: string;
  quizAttempt: string;
  question: string;
  selectedOption?: string;
  selectedOptions?: string[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  feedback?: string;
  answeredAt: string;
  createdAt: string;
  updatedAt: string;
}
