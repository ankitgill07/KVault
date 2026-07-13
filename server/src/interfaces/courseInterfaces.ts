import mongoose, { Document } from "mongoose";
import type { IUser } from "./interfaces.js";

// ─── Category Interface ────────────────────────────────────────────────────────

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategory?: mongoose.Types.ObjectId | ICategory;
  subcategories: mongoose.Types.ObjectId[];
  isActive: boolean;
  courseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Course Interface ─────────────────────────────────────────────────────────

export interface ICourse extends Document {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  
  // ── Categorization ─────────────────────────────────────
  category: mongoose.Types.ObjectId | ICategory
  tags: string[];
  level: CourseLevel;
  language: string;
  
  // ── Media ───────────────────────────────────────────────
  thumbnailUrl?: string;
  thumbnailKey?: string;
  
  // ── Instructors ─────────────────────────────────────
  primaryInstructor: mongoose.Types.ObjectId | IUser;
  
  // ── Course Details ──────────────────────────────────────
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  duration: number; // in minutes
  totalLessons: number;
  totalModules: number;
  
  // ── Pricing ─────────────────────────────────────────────
  price: number;
  discountPrice?: number;
  currency: string;
  isFree: boolean;
  
  // ── Status & Visibility ─────────────────────────────────
  status: CourseStatus;
  isPublished: boolean;
  publishedAt?: Date;
  featured: boolean;
  
  // ── Statistics ──────────────────────────────────────────
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  
  // ── SEO ─────────────────────────────────────────────────
  metaKeywords?: string[];
  
  // ── Additional Info ─────────────────────────────────────
  certificateEnabled: boolean;
  lifetimeAccess: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ─── Module Interface ─────────────────────────────────────────────────────────

export interface IModule extends Document {
  course: mongoose.Types.ObjectId | ICourse;
  title: string;
  description?: string;
  order: number;
  duration: number; // in minutes
  isPublished: boolean;
  isFree: boolean; // If module is free to preview
  totalLessons: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Lesson Interface ─────────────────────────────────────────────────────────

export interface ILesson extends Document {
  module: mongoose.Types.ObjectId | IModule;
  course: mongoose.Types.ObjectId | ICourse;
  title: string;
  description?: string;
  order: number;
  
  // ── Content Type ────────────────────────────────────────
  contentType: LessonContentType;
  
  // ── Video Content ───────────────────────────────────────
  videoUrl?: string;
  videoKey?: string;
  videoStatus?: 'pending' | 'processing' | 'ready' | 'failed';
  videoProvider?: VideoProvider;
  
  // ── Text Content ────────────────────────────────────────
  textContent?: string;
  markdownContent?: string;
  
  // ── Resource Files ──────────────────────────────────────
  resources: mongoose.Types.ObjectId[] | IResource[];
  
  // ── Quiz/Assessment ─────────────────────────────────────
  quiz?: mongoose.Types.ObjectId | IQuiz;
  
  // ── Lesson Settings ─────────────────────────────────────
  durationSeconds: number; // in seconds
  isPublished: boolean;
  isFree: boolean;
  isPreview: boolean;
  canDownload: boolean;
  
  // ── Statistics ──────────────────────────────────────────
  viewCount: number;
  completionCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ─── Resource Interface ───────────────────────────────────────────────────────

export interface IResource extends Document {
  lesson: mongoose.Types.ObjectId | ILesson;
  title: string;
  description?: string;
  
  // ── Resource Type ───────────────────────────────────────
  type: ResourceType;
  
  // ── File Details ────────────────────────────────────────
  url: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  
  // ── Settings ────────────────────────────────────────────
  isDownloadable: boolean;
  downloadCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ─── Enrollment Interface ─────────────────────────────────────────────────────

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId | IUser;
  course: mongoose.Types.ObjectId | ICourse;
  
  // ── Progress Tracking ───────────────────────────────────
  progress: number; // percentage 0-100
  completedLessons: mongoose.Types.ObjectId[] | ILesson[];
  completedModules: mongoose.Types.ObjectId[] | IModule[];
  currentLesson?: mongoose.Types.ObjectId | ILesson;
  currentModule?: mongoose.Types.ObjectId | IModule;
  lessonProgress?: Map<string, number>;
  
  // ── Time Tracking ───────────────────────────────────────
  totalTimeSpent: number; // in minutes
  lastAccessedAt: Date;
  completedAt?: Date;
  
  // ── Status ──────────────────────────────────────────────
  status: EnrollmentStatus;
  isCompleted: boolean;
  
  // ── Certificate ─────────────────────────────────────────
  certificateIssued: boolean;
  certificateUrl?: string;
  certificateIssuedAt?: Date;
  
  // ── Payment Info ────────────────────────────────────────
  amountPaid: number;
  paymentMethod?: string;
  transactionId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ─── Review Interface ─────────────────────────────────────────────────────────

export interface IReview extends Document {
  course: mongoose.Types.ObjectId | ICourse;
  student: mongoose.Types.ObjectId | IUser;
  
  // ── Rating ──────────────────────────────────────────────
  rating: number; // 1-5
  title?: string;
  comment?: string;
  
  // ── Review Details ──────────────────────────────────────
  pros?: string[];
  cons?: string[];
  
  // ── Engagement ──────────────────────────────────────────
  helpfulCount: number;
  reportCount: number;
  isVerified: boolean; // Verified purchase
  
  // ── Status ──────────────────────────────────────────────
  isApproved: boolean;
  isFeatured: boolean;
  
  // ── Response from Instructor ────────────────────────────
  instructorResponse?: string;
  instructorRespondedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quiz Interface ───────────────────────────────────────────────────────────

export interface IQuiz extends Document {
  lesson: mongoose.Types.ObjectId | ILesson;
  course: mongoose.Types.ObjectId | ICourse;
  title: string;
  description?: string;
  instructions?: string;
  
  // ── Quiz Settings ───────────────────────────────────────
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  showResultsImmediately: boolean;
  
  // ── Questions ───────────────────────────────────────────
  questions: mongoose.Types.ObjectId[] | IQuestion[];
  totalQuestions: number;
  totalPoints: number;
  
  // ── Statistics ──────────────────────────────────────────
  attemptCount: number;
  averageScore: number;
  passRate: number;
  
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Question Interface ───────────────────────────────────────────────────────

export interface IQuestion extends Document {
  quiz: mongoose.Types.ObjectId | IQuiz;
  
  // ── Question Content ────────────────────────────────────
  questionText: string;
  questionType: QuestionType;
  points: number;
  order: number;
  
  // ── Media ───────────────────────────────────────────────
  image?: string;
  audio?: string;
  
  // ── Options (for MCQ) ───────────────────────────────────
  options: IOption[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  
  // ── Settings ────────────────────────────────────────────
  isRequired: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ─── Option Interface ─────────────────────────────────────────────────────────

export interface IOption extends Document {
  question: mongoose.Types.ObjectId | IQuestion;
  optionText: string;
  isCorrect: boolean;
  order: number;
  explanation?: string;
}

// ─── Quiz Attempt Interface ───────────────────────────────────────────────────

export interface IQuizAttempt extends Document {
  quiz: mongoose.Types.ObjectId | IQuiz;
  student: mongoose.Types.ObjectId | IUser;
  course: mongoose.Types.ObjectId | ICourse;
  
  // ── Attempt Details ─────────────────────────────────────
  attemptNumber: number;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds
  
  // ── Answers ─────────────────────────────────────────────
  answers: IAnswer[];
  
  // ── Results ─────────────────────────────────────────────
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  
  // ── Review ──────────────────────────────────────────────
  reviewedAnswers?: mongoose.Types.ObjectId[] | IAnswer[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ─── Answer Interface ─────────────────────────────────────────────────────────

export interface IAnswer extends Document {
  quizAttempt: mongoose.Types.ObjectId | IQuizAttempt;
  question: mongoose.Types.ObjectId | IQuestion;
  
  // ── Answer Content ──────────────────────────────────────
  selectedOption?: mongoose.Types.ObjectId | IOption;
  selectedOptions?: mongoose.Types.ObjectId[] | IOption[];
  textAnswer?: string;
  
  // ── Grading ─────────────────────────────────────────────
  isCorrect: boolean;
  pointsEarned: number;
  feedback?: string;
  
  answeredAt: Date;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  ALL_LEVELS = "all_levels",
}

export enum CourseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
  UNDER_REVIEW = "under_review",
}

export enum LessonContentType {
  VIDEO = "video",
  TEXT = "text",
  MARKDOWN = "markdown",
  PRESENTATION = "presentation",
  AUDIO = "audio",
  CODE = "code",
  INTERACTIVE = "interactive",
  PDF = "pdf",
  ARTICLE = "article",
  LINK = "link",
  QUIZ = "quiz",
  ASSIGNMENT = "assignment",
}

export enum VideoProvider {
  YOUTUBE = "youtube",
  VIMEO = "vimeo",
  CUSTOM = "custom",
  AWS_S3 = "aws_s3",
}

export enum ResourceType {
  PDF = "pdf",
  DOCUMENT = "document",
  SPREADSHEET = "spreadsheet",
  PRESENTATION = "presentation",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  CODE_FILE = "code_file",
  ARCHIVE = "archive",
  LINK = "link",
}

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DROPPED = "dropped",
  PAUSED = "paused",
  EXPIRED = "expired",
}

export enum QuestionType {
  MCQ_SINGLE = "mcq_single",
  MCQ_MULTIPLE = "mcq_multiple",
  TRUE_FALSE = "true_false",
  FILL_BLANK = "fill_blank",
  ESSAY = "essay",
  CODE = "code",
  MATCHING = "matching",
}