import React from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "./Cards/CourseCard";
import { PurchasedCourseCard } from "./Cards/PurchasedCourseCard";
import type { Course } from "../api/courseApi";
import type { Enrollment } from "../api/enrollmentApi";
import { getCoursePlayerPath } from "../routes/routeConfig";

interface CourseSectionProps {
  title: string;
  courses: Course[];
  description?: string;
  limit?: number;
  isPurchasedSection?: boolean;
  enrollments?: Enrollment[];
  lastWatchedByCourseId?: Record<string, any>;
}

function CourseSection({
  title,
  courses,
  description = "Explore our hand-picked courses",
  limit = 6,
  isPurchasedSection = false,
  enrollments = [],
  lastWatchedByCourseId = {},
}: CourseSectionProps) {
  const navigate = useNavigate();
  // Helper to get instructor name from course
  const getInstructorName = (course: Course): string => {
    if (course.primaryInstructor && typeof course.primaryInstructor === 'object' && (course.primaryInstructor as any).name) {
      return (course.primaryInstructor as any).name;
    }
    return "Instructor";
  };

  // Helper to get enrollment progress for a course
  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find((e) => {
      const courseIdValue = typeof e.course === 'string' 
        ? e.course 
        : (e.course as any)?._id;
      return courseIdValue === courseId;
    });
    return enrollment?.progress ?? 0;
  };

  const getEnrollmentLastAccessed = (courseId: string) => {
    const enrollment = enrollments.find((e) => {
      const courseIdValue = typeof e.course === 'string' 
        ? e.course 
        : (e.course as any)?._id;
      return courseIdValue === courseId;
    });
    return enrollment?.lastAccessed || undefined;
  };

  const getEnrollmentCurrentLessonId = (courseId: string) => {
    const enrollment = enrollments.find((e) => {
      const courseIdValue = typeof e.course === 'string' 
        ? e.course 
        : (e.course as any)?._id;
      return courseIdValue === courseId;
    });

    const currentLesson = enrollment?.currentLesson as any;
    return typeof currentLesson === "string" ? currentLesson : currentLesson?._id;
  };

  const getLastWatchedLessonId = (courseId: string) => {
    const lastWatched = lastWatchedByCourseId[courseId];
    return typeof lastWatched === "string" ? lastWatched : lastWatched?._id;
  };

  const getLastLessonTitle = (courseId: string) => {
    const lastWatched = lastWatchedByCourseId[courseId];
    return lastWatched?.title || getEnrollmentLastAccessed(courseId);
  };

  // Helper to handle course click - navigate to the last watched lesson when known.
  const handleCourseClick = (course: Course) => {
    const lessonId =
      getLastWatchedLessonId(course._id) || getEnrollmentCurrentLessonId(course._id);
    navigate(getCoursePlayerPath(course.slug, lessonId));
  };

  return (
    <div>
      {" "}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-brand-navy">{title}</h2>
            <p className="text-brand-gray text-sm mt-1">
              {description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isPurchasedSection
            ? courses.slice(0, limit).map((course: Course) => (
                <PurchasedCourseCard
                  key={course._id}
                  title={course.title}
                  instructor={getInstructorName(course)}
                  cover={course.thumbnailUrl || ""}
                  progressPercent={getEnrollmentProgress(course._id)}
                  lastLessonTitle={getLastLessonTitle(course._id)}
                  onClick={() => handleCourseClick(course)}
                />
              ))
            : courses.slice(0, limit).map((course: Course) => (
                <CourseCard key={course._id} course={course} />
              ))}
        </div>
      </div>
    </div>
  );
}

export default CourseSection;
