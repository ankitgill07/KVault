import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Course } from '../data/courses';

interface ContinueLearningProps {
  courses: Course[];
  onResume: (course: Course) => void;
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({ courses, onResume }) => {
  // Show only courses with active progress > 0
  const activeCourses = courses.filter(c => c.progress !== undefined && c.progress > 0);

  if (activeCourses.length === 0) return null;

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-purple animate-ping"></div>
          <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight">
            Continue Learning
          </h2>
        </div>
        <span className="text-xs font-bold text-brand-gray">
          Tracked locally on this device
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeCourses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-3xl p-6 border border-brand-border premium-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            {/* Left: Thumbnail & Details */}
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[10px] font-black shrink-0"
                style={{ background: course.gradient }}
              >
                {course.skills[0]}
              </div>
              
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-purple">
                  {course.category}
                </span>
                <h3 className="font-extrabold text-sm text-brand-navy truncate">
                  {course.title}
                </h3>
                <p className="text-xs text-brand-gray truncate">
                  Last lesson: <span className="font-semibold text-brand-navy">{course.lastAccessed}</span>
                </p>
              </div>
            </div>

            {/* Right: Progress & Resume button */}
            <div className="flex items-center gap-6 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
              <div className="space-y-1 w-24">
                <div className="flex justify-between text-[11px] font-bold text-brand-navy">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => onResume(course)}
                className="px-5 py-2.5 rounded-2xl bg-brand-navy hover:bg-brand-purple text-white text-xs font-bold transition-all duration-200 premium-shadow flex items-center gap-1.5 cursor-pointer hover:scale-102"
              >
                <Play className="w-3 h-3 fill-white text-white stroke-[3px]" />
                <span>Resume</span>
              </button>
            </div>

          </motion.div>
        ))}
      </div>
    </section>
  );
};
