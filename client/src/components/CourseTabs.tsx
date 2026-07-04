import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  BookOpen,
  Heart,
  ShoppingBag,
  Check,
  X,
} from "lucide-react";
import type { Course } from "../api/courseApi";
import { useAllCourses } from "../hooks/useAllCourses";
import { WelcomeBanner } from "./WelcomeBanner";
import CourseSection from "./CourseSection";

interface CourseTabsProps {
  cart: string[];
  wishlist: string[];
  onToggleCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onSelectCourse: (course: Course) => void;
}

export const CourseTabs: React.FC = () => {
  const { courses, loading, error } = useAllCourses();
  const [selectedTab, setSelectedTab] = useState("Popular");

  const popularCourses = [...courses]
    .filter((course) => course.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const trendingCourses = [...courses]
    .sort((a, b) => {
      if (b.enrollmentCount !== a.enrollmentCount) {
        return b.enrollmentCount - a.enrollmentCount;
      }

      return b.rating - a.rating;
    })
    .slice(0, 6);
  const bestSellerCourses = [...courses]
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 6);

  const recommendedCourses = [...courses]
    .sort((a, b) => {
      const scoreA = a.rating * 2 + a.enrollmentCount / 100;
      const scoreB = b.rating * 2 + b.enrollmentCount / 100;

      return scoreB - scoreA;
    })
    .slice(0, 6);

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
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Banner */}
      <WelcomeBanner />
      <CourseSection title="⭐ Recommended" courses={recommendedCourses} />

      <CourseSection title="🔥 Popular Courses" courses={popularCourses} />

      <CourseSection title="📈 Trending Now" courses={trendingCourses} />

      <CourseSection title="🏆 Best Sellers" courses={bestSellerCourses} />
    </section>
  );
};
