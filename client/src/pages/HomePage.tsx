import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchMyEnrollments,
  selectEnrollments,
} from "../store/enrollmentSlice";
import { fetchCourseProgress } from "../store/progressSlice";
import { useAllCourses } from "../hooks/useAllCourses";
import { WelcomeBanner, type WelcomeStatus } from "../components/WelcomeBanner";
import CourseSection from "../components/CourseSection";
import { Skeleton } from "../components/ui/skeleton";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, user, loading: userLoading } = useUser();
  const { courses, loading: coursesLoading, error } = useAllCourses();
  const dispatch = useAppDispatch();
  const enrollments = useAppSelector(selectEnrollments);
  const lastWatchedByCourseId = useAppSelector(
    (state) => state.progress.lastWatched,
  );

  // Scroll to top on page load to prevent auto-scroll down on refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      dispatch(fetchMyEnrollments());
    }
  }, [dispatch, isSignedIn]);

  // Get enrolled course IDs
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

  // Fetch progress for enrolled courses
  useEffect(() => {
    if (!isSignedIn) return;

    enrolledCourseIds.forEach((courseId) => {
      dispatch(fetchCourseProgress(courseId));
    });
  }, [dispatch, enrolledCourseIds, isSignedIn]);

  // Separate enrolled and discover courses
  const enrolledCourses = useMemo(
    () => courses.filter((course) => enrolledCourseIds.has(course._id)),
    [courses, enrolledCourseIds],
  );

  const discoverCourses = useMemo(
    () => courses.filter((course) => !enrolledCourseIds.has(course._id)),
    [courses, enrolledCourseIds],
  );

  // Calculate streak days based on enrollment lastAccessed dates
  const streakDays = useMemo(() => {
    if (!isSignedIn || enrollments.length === 0) return 0;

    // Get all lastAccessed dates from enrollments
    const accessDates = enrollments
      .map((e) => e.lastAccessed)
      .filter(Boolean)
      .map((dateStr) => {
        const date = new Date(dateStr!);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      });

    if (accessDates.length === 0) return 0;

    // Sort dates descending
    accessDates.sort((a, b) => b.getTime() - a.getTime());

    // Calculate consecutive days streak
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user accessed today or yesterday
    const hasAccessToday = accessDates.some(d => d.getTime() === today.getTime());
    const hasAccessYesterday = accessDates.some(d => d.getTime() === yesterday.getTime());

    if (!hasAccessToday && !hasAccessYesterday) return 0;

    // Count consecutive days
    for (let i = 0; i < accessDates.length - 1; i++) {
      const diffTime = accessDates[i].getTime() - accessDates[i + 1].getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [isSignedIn, enrollments]);

  // Determine welcome status based on user state
  const getWelcomeStatus = (): WelcomeStatus => {
    if (!isSignedIn) return "no-purchases";
    if (enrolledCourses.length === 0) return "no-purchases";
    return "active";
  };

  // Handle loading state - only show content loading since MainLayout handles header/footer
  if (userLoading || coursesLoading) {
    return <HomePageLoadingSkeleton isSignedIn={isSignedIn} />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-brand-navy mb-2">
            Error loading content
          </h2>
          <p className="text-sm text-brand-gray">{error}</p>
        </div>
      </div>
    );
  }

  // Handle resume learning
  const handleResumeLearning = () => {
    if (enrolledCourses.length > 0) {
      navigate(`/my-learning`);
    }
  };

  // Handle browse courses
  const handleBrowseCourses = () => {
    navigate("/courses");
  };

  return (
    <div className="min-h-screen bg-premium-mesh">
      {isSignedIn && (
        <div className="px-4 md:px-8 max-w-7xl mx-auto pt-8">
          <WelcomeBanner
            userName={user?.name}
            status={getWelcomeStatus()}
            streakDays={streakDays}
            coursesInProgress={enrolledCourses.length}
            onResumeLearning={handleResumeLearning}
            onBrowseCourses={handleBrowseCourses}
          />
        </div>
      )}

      {isSignedIn && enrolledCourses.length > 0 && (
        <section className="pt-12 px-4 md:px-8 max-w-7xl mx-auto">
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

      {/* Discover Courses Section */}
      <section
        className={
          isSignedIn && enrolledCourses.length > 0
            ? "py-12 px-4 md:px-8 max-w-7xl mx-auto"
            : "py-20 px-4 md:px-8 max-w-7xl mx-auto"
        }
      >
        <CourseSection
          title="Discover Courses"
          description="Explore new courses you have not purchased yet"
          courses={discoverCourses}
        />
      </section>
    </div>
  );
};

// Content Loading Skeleton - only for main content since MainLayout handles header/footer
interface HomePageLoadingSkeletonProps {
  isSignedIn: boolean;
}

const HomePageLoadingSkeleton: React.FC<HomePageLoadingSkeletonProps> = ({ isSignedIn }) => {
  return (
    <div className="flex-1 w-full">
      {/* Welcome Banner Skeleton - only show if signed in */}
      {isSignedIn && (
        <div className="px-4 md:px-8 max-w-7xl mx-auto pt-8">
          <Skeleton className="w-full h-64 rounded-[32px] mb-10" />
        </div>
      )}

      {/* Discover Courses Section Skeleton */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Skeleton className="w-48 h-8 rounded-lg mb-6" />
        <Skeleton className="w-64 h-5 rounded-lg mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-3xl" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;