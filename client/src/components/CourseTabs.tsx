import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, BookOpen, Heart, ShoppingBag, Check } from 'lucide-react';
import type { Course } from '../data/courses';

interface CourseTabsProps {
  courses: Course[];
  cart: string[];
  wishlist: string[];
  onToggleCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onSelectCourse: (course: Course) => void;
}

type TabType = 'Popular' | 'Trending' | 'New Releases' | 'Development' | 'Design' | 'AI';

export const CourseTabs: React.FC<CourseTabsProps> = ({
  courses,
  cart,
  wishlist,
  onToggleCart,
  onToggleWishlist,
  onSelectCourse
}) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('Popular');

  const tabs: TabType[] = ['Popular', 'Trending', 'New Releases', 'Development', 'Design', 'AI'];

  // Filter logic
  const getFilteredCourses = (): Course[] => {
    switch (selectedTab) {
      case 'Popular':
        return courses.filter(c => c.rating >= 4.85);
      case 'Trending':
        return courses.filter(c => c.reviewsCount > 80);
      case 'New Releases':
        return courses.filter(c => c.id === 'ai-eng' || c.id === 'cloud-kube' || c.id === 'cyber-sec');
      case 'Development':
        return courses.filter(c => 
          ['Frontend Development', 'Backend Development', 'Full Stack', 'Cloud Computing', 'DevOps'].includes(c.category)
        );
      case 'Design':
        return courses.filter(c => c.category === 'UI/UX Design');
      case 'AI':
        return courses.filter(c => ['AI & Machine Learning', 'Data Science'].includes(c.category));
      default:
        return courses;
    }
  };

  const filteredCourses = getFilteredCourses();

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple">
            Course Catalogue
          </span>
          <h2 className="text-4xl font-extrabold text-brand-navy tracking-tight">
            Thoughtfully Curated Courses
          </h2>
          <p className="text-base text-brand-gray font-medium leading-relaxed">
            Acquire deep knowledge. Zero fluff. Skip the endless playlists and start building.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-brand-border/60 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`relative px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'text-brand-purple bg-brand-purple/5' 
                  : 'text-brand-gray hover:text-brand-navy'
              }`}
            >
              {tab}
              {isActive && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand-purple"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course) => {
            const inCart = cart.includes(course.id);
            const inWishlist = wishlist.includes(course.id);

            return (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-[32px] border border-brand-border premium-shadow hover:premium-shadow-hover transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                
                {/* Visual Thumbnail */}
                <div 
                  onClick={() => onSelectCourse(course)}
                  className="h-48 w-full relative cursor-pointer flex items-center justify-center p-6 text-white overflow-hidden select-none"
                  style={{ background: course.gradient }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>

                  <div className="relative text-center space-y-2 z-10">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
                      {course.category}
                    </span>
                    <h3 className="font-extrabold text-lg line-clamp-2 px-2 text-white drop-shadow-sm leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <div className="absolute bottom-3 left-4 flex gap-1">
                    {course.skills.slice(0, 2).map((skill, sIdx) => (
                      <span key={sIdx} className="text-[9px] font-mono bg-white/25 px-2 py-0.5 rounded border border-white/10 text-white font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <span className="absolute top-3 right-4 text-[9px] font-bold uppercase tracking-wider bg-black/25 text-white px-2.5 py-0.5 rounded-full border border-white/5">
                    {course.difficulty}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Instructor Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={course.instructorAvatar} 
                          alt={course.instructor} 
                          className="w-8 h-8 rounded-full border border-brand-purple/10 bg-bg-secondary object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-brand-navy leading-none">{course.instructor}</p>
                          <p className="text-[10px] text-brand-gray mt-0.5 leading-none">{course.instructorRole}</p>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 bg-brand-gold/10 px-2 py-1 rounded-xl text-brand-gold">
                        <Star className="w-3.5 h-3.5 fill-brand-gold" />
                        <span className="text-xs font-extrabold">{course.rating.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-brand-gray font-semibold leading-relaxed mb-6 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Course Metrics */}
                    <div className="flex items-center gap-4 text-xs font-bold text-brand-gray mb-6 border-b border-brand-border/40 pb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-brand-purple" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-brand-blue" />
                        <span>{course.lessonsCount} lessons</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-brand-navy">${course.price}</span>
                        <span className="text-xs font-bold text-brand-gray line-through">${course.originalPrice}</span>
                      </div>
                      <span className="text-[10px] text-brand-success font-bold">Lifetime access</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleWishlist(course.id)}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                          inWishlist 
                            ? 'bg-red-50 text-red-500 border-red-200' 
                            : 'bg-white text-brand-gray hover:text-brand-purple border-brand-border hover:border-brand-purple/40'
                        }`}
                        title="Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => onToggleCart(course.id)}
                        className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                          inCart
                            ? 'bg-brand-success/10 text-brand-success border border-brand-success/20'
                            : 'bg-brand-navy text-white hover:bg-brand-purple premium-shadow'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </section>
  );
};
