// ─── Course Models Index ─────────────────────────────────────────────────────
// This file provides easy access to all course-related models and interfaces

// ─── Models ───────────────────────────────────────────────────────────────────

export { default as Category } from "./categoryModel.js";
export { default as Course } from "./courseModel.js";
export { default as Module } from "./moduleModel.js";
export { default as Lesson } from "./lessonModel.js";
export { default as Resource } from "./resourceModel.js";
export { default as Enrollment } from "./enrollmentModel.js";
export { default as Review } from "./reviewModel.js";
export { default as LessonProgress } from "./lessonProgressModel.js";
export { default as RecentlyWatched } from "./recentlyWatchedModel.js";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type {
  ICategory,
  ICourse,
  IModule,
  ILesson,
  IResource,
  IEnrollment,
  IReview,
  IQuiz,
  IQuestion,
  IOption,
  IQuizAttempt,
  IAnswer,
} from "../interfaces/courseInterfaces.js";
export type { ILessonProgress } from "./lessonProgressModel.js";
export type { IRecentlyWatched } from "./recentlyWatchedModel.js";

// ─── Enums ────────────────────────────────────────────────────────────────────

export {
  CourseLevel,
  CourseStatus,
  LessonContentType,
  VideoProvider,
  ResourceType,
  EnrollmentStatus,
  QuestionType,
} from "../interfaces/courseInterfaces.js";

// ─── Model Names (for reference) ──────────────────────────────────────────────

export const MODEL_NAMES = {
  CATEGORY: "Category",
  COURSE: "Course",
  MODULE: "Module",
  LESSON: "Lesson",
  RESOURCE: "Resource",
  ENROLLMENT: "Enrollment",
  REVIEW: "Review",
  QUIZ: "Quiz",
  QUESTION: "Question",
  OPTION: "Option",
  QUIZ_ATTEMPT: "QuizAttempt",
  ANSWER: "Answer",
  LESSON_PROGRESS: "LessonProgress",
  RECENTLY_WATCHED: "RecentlyWatched",
} as const;

// ─── Relationship Map ─────────────────────────────────────────────────────────
// This shows how models are connected to each other

export const RELATIONSHIPS = {
  // Category hierarchy
  Category: {
    parentCategory: "Category",
    subcategories: ["Category"],
  },

  // Course relationships
  Course: {
    category: "Category",
    primaryInstructor: "User",
  },

  // Module relationships
  Module: {
    course: "Course",
  },

  // Lesson relationships
  Lesson: {
    module: "Module",
    course: "Course",
    resources: ["Resource"],
    quiz: "Quiz",
  },

  // Resource relationships
  Resource: {
    lesson: "Lesson",
  },

  // Enrollment relationships
  Enrollment: {
    student: "User",
    course: "Course",
    completedLessons: ["Lesson"],
    completedModules: ["Module"],
    currentLesson: "Lesson",
    currentModule: "Module",
  },

  // Review relationships
  Review: {
    course: "Course",
    student: "User",
  },

  // Quiz relationships
  Quiz: {
    lesson: "Lesson",
    course: "Course",
    questions: ["Question"],
  },

  // Question relationships
  Question: {
    quiz: "Quiz",
    options: ["Option"],
  },

  // Option relationships
  Option: {
    question: "Question",
  },

  // Quiz Attempt relationships
  QuizAttempt: {
    quiz: "Quiz",
    student: "User",
    course: "Course",
    answers: ["Answer"],
    reviewedAnswers: ["Answer"],
  },

  // Answer relationships
  Answer: {
    quizAttempt: "QuizAttempt",
    question: "Question",
    selectedOption: "Option",
    selectedOptions: ["Option"],
  },
} as const;

// ─── Quick Access Helper ──────────────────────────────────────────────────────

export const getModelByName = (name: string) => {
  const models: Record<string, any> = {
    Category: () => import("./categoryModel.js"),
    Course: () => import("./courseModel.js"),
    Module: () => import("./moduleModel.js"),
    Lesson: () => import("./lessonModel.js"),
    Resource: () => import("./resourceModel.js"),
    Enrollment: () => import("./enrollmentModel.js"),
    Review: () => import("./reviewModel.js"),
    LessonProgress: () => import("./lessonProgressModel.js"),
    RecentlyWatched: () => import("./recentlyWatchedModel.js"),
  };

  const modelLoader = models[name];
  if (!modelLoader) {
    throw new Error(`Model "${name}" not found`);
  }
  return modelLoader();
};

// ─── Usage Example ────────────────────────────────────────────────────────────
/*
  Import all models:
  import { Category, Course, Module, Lesson } from './models';

  Import specific interfaces:
  import type { ICourse, ICategory } from './models';

  Import enums:
  import { CourseLevel, CourseStatus } from './models';

  Get model by name:
  const { default: Course } = await getModelByName('Course');
*/