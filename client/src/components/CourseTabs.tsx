import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import type { Course } from "../api/courseApi";
import { useAllCourses } from "../hooks/useAllCourses";
import CourseSection from "./CourseSection";
import { useUser } from "../context/UserContext";
import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchMyEnrollments,
  selectEnrollments,
} from "../store/enrollmentSlice";
import { fetchCourseProgress } from "../store/progressSlice";

interface CourseTabsProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onSelectCourse: (course: Course) => void;
}

export const CourseTabs: React.FC = () => {
  const { courses, loading, error } = useAllCourses();
  const dispatch = useAppDispatch();
  const { isSignedIn, user } = useUser();
  const enrollments = useAppSelector(selectEnrollments);
  const lastWatchedByCourseId = useAppSelector(
    (state) => state.progress.lastWatched,
  );

  useEffect(() => {
    if (isSignedIn) {
      dispatch(fetchMyEnrollments());
    }
  }, [dispatch, isSignedIn]);

  const enrolledCourseIds = useMemo(
    () =>
      new Set(
        enrollments
          .map((enrollment) =>
            typeof enrollment.course === "string"
              ? enrollment.course
              : enrollment.course?._id,
          )
          .filter(Boolean),
      ),
    [enrollments],
  );

  useEffect(() => {
    if (!isSignedIn) return;

    enrolledCourseIds.forEach((courseId) => {
      dispatch(fetchCourseProgress(courseId));
    });
  }, [dispatch, enrolledCourseIds, isSignedIn]);

  const enrolledCourses = useMemo(
    () => courses.filter((course) => enrolledCourseIds.has(course._id)),
    [courses, enrolledCourseIds],
  );

  const discoverCourses = useMemo(
    () => courses.filter((course) => !enrolledCourseIds.has(course._id)),
    [courses, enrolledCourseIds],
  );

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto text-brand-purple mb-4">
            <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="font-extrabold text-lg text-brand-navy">
            Loading courses...
          </h3>
          <p className="text-xs text-brand-gray mt-2 max-w-sm mx-auto font-medium">
            Please wait while we fetch the latest courses for you.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-brand-navy">
            Error loading courses
          </h3>
          <p className="text-xs text-brand-gray mt-2 max-w-sm mx-auto font-medium">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="p-4 md:px-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl  tracking-tight leading-tight font-bold">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
      </div>
      {enrolledCourses.length > 0 && (
        <section className="pt-12">
          <CourseSection
            title="Let's start learning"
            description="Jump back into the courses you already own"
            courses={enrolledCourses}
            limit={4}
            isPurchasedSection={true}
            enrollments={enrollments}
            lastWatchedByCourseId={lastWatchedByCourseId}
          />
        </section>
      )}
      <section className={enrolledCourses.length > 0 ? "py-6" : "py-20"}>
        <CourseSection
          title="Discover Courses"
          description="Explore new courses you have not purchased yet"
          courses={discoverCourses}
        />
      </section>
    </div>
  );
};
