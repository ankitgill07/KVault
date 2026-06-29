import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { WhyChoose } from '../components/WhyChoose';
import { BentoPaths } from '../components/BentoPaths';
import { CourseTabs } from '../components/CourseTabs';
import { ContinueLearning } from '../components/ContinueLearning';
import { Community } from '../components/Community';
import type { Course } from '../data/courses';
import { useAllCourses } from '../hooks/useAllCourses';

interface HomeProps {
  cart: string[];
  wishlist: string[];
  enrolledCourses: string[];
  courseProgress: Record<string, any>;
  onToggleCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  cart,
  wishlist,
  enrolledCourses,
  courseProgress,
  onToggleCart,
  onToggleWishlist,
}) => {
  const navigate = useNavigate();
  const { courses: allCourses } = useAllCourses();

  const handleSelectCourse = (course: Course) => {
    navigate(`/course/${course.slug}`);
  };

  const handleResumeCourse = (course: { slug: string }) => {
    navigate(`/learn/${course.slug}`);
  };

  // Create full course list with local progress mapped from courseProgress prop
  const coursesWithProgress = allCourses
    .filter(course => enrolledCourses.includes(course.id))
    .map(course => {
      const prog = courseProgress[course.id];
      return {
        ...course,
        progress: prog ? prog.progress : 0,
        lastAccessed: prog ? prog.lastAccessed : '',
        completedLessons: prog ? prog.completedLessons : [],
      };
    });

  return (
    <main className="flex-1">
      <Hero 
        onExploreClick={() => {
          const el = document.getElementById('explore-catalog');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onStartClick={() => navigate(enrolledCourses.length > 0 ? '/my-learning' : '/courses')}
      />

      {/* Continue learning */}
      {enrolledCourses.length > 0 && (
        <ContinueLearning 
          courses={coursesWithProgress}
          onResume={handleResumeCourse}
        />
      )}

      {/* Categories */}
      <Categories 
        onSelectCategory={(catName) => {
          // Find cat slug
          const slug = catName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
          navigate(`/category/${slug}`);
        }}
      />

      {/* Why Choose Section */}
      <WhyChoose />

      {/* Learning Paths Bento Grid */}
      <BentoPaths 
        onPathSelect={(pathId) => {
          navigate('/courses');
        }}
      />

      {/* Main catalog container */}
      <div id="explore-catalog">
        <CourseTabs 
          cart={cart}
          wishlist={wishlist}
          onToggleCart={onToggleCart}
          onToggleWishlist={onToggleWishlist}
          onSelectCourse={handleSelectCourse}
        />
      </div>

      {/* Community values */}
      <Community />
    </main>
  );
};
