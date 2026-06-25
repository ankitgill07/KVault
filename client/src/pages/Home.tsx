import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { WhyChoose } from '../components/WhyChoose';
import { BentoPaths } from '../components/BentoPaths';
import { CourseTabs } from '../components/CourseTabs';
import { ContinueLearning } from '../components/ContinueLearning';
import { Community } from '../components/Community';
import { COURSES } from '../data/courses';
import type { Course } from '../data/courses';

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

  // Create full course list with local progress mapped from courseProgress prop
  const coursesWithProgress = COURSES.map(course => {
    const prog = courseProgress[course.id];
    return {
      ...course,
      progress: prog ? prog.progress : undefined,
      lastAccessed: prog ? prog.lastAccessed : undefined
    };
  });

  const handleSelectCourse = (course: Course) => {
    navigate(`/course/${course.slug}`);
  };

  const handleResumeCourse = (course: Course) => {
    navigate(`/learn/${course.slug}`);
  };

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
          courses={COURSES}
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
