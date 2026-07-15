// src/components/CourseSidebar.tsx
//
// Course Sidebar Component - Displays course curriculum with modules and lessons
// Shows progress, search functionality, and lesson navigation

import { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Lock,
  X
} from 'lucide-react';
import type { CourseData, Lesson } from '../lib/courseTypes';
import { formatDuration } from '../utils/Helping';

interface CourseSidebarProps {
  course: CourseData;
  currentLessonId: string;
  completedLessons: string[];
  onLessonSelect: (lessonId: string) => void;
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CourseSidebar({
  course,
  currentLessonId,
  completedLessons,
  onLessonSelect,
  progressPercentage,
  completedCount,
  totalCount,
  isOpen = false,
  onClose
}: CourseSidebarProps) {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(course.modules.map(m => m._id))
  );

  // Flatten all lessons for easier navigation
  const allLessons = useMemo(() => {
    return course.modules.flatMap(module =>
      module.lessons.map(lesson => ({
        ...lesson,
        moduleId: module._id,
        moduleTitle: module.title
      }))
    );
  }, [course.modules]);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!sidebarSearch) return course.modules;

    return course.modules
      .map(module => ({
        ...module,
        lessons: module.lessons.filter(lesson =>
          lesson.title.toLowerCase().includes(sidebarSearch.toLowerCase())
        )
      }))
      .filter(section => section.lessons.length > 0);
  }, [course.modules, sidebarSearch]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (!lesson.locked) {
      onLessonSelect(lesson._id);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-[380px] bg-[#0c0c10] border-l border-zinc-900 z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-10 lg:h-full lg:overflow-hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-900 lg:hidden">
            <h2 className="font-semibold text-zinc-100">Course Content</h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-450 hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>



          {/* Search */}
          <div className="p-4 border-b border-zinc-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent placeholder-zinc-550"
              />
            </div>
          </div>

          {/* Curriculum List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 pt-2">
            {filteredSections.map((module) => (
              <div key={module._id} className="mb-2">
                <button
                  onClick={() => toggleSection(module._id)}
                  className="flex items-center justify-between w-full py-3 px-2 text-left hover:bg-zinc-900/60 rounded-lg transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-zinc-200 block truncate">
                      {module.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {module.totalLessons} lessons
                    </span>
                  </div>
                  {expandedSections.has(module._id) ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
                  )}
                </button>

                {expandedSections.has(module._id) && (
                  <div className="space-y-1 ml-2">
                    {module.lessons.map((lesson) => {
                      const isCurrentLesson = lesson._id === currentLessonId;
                      const isLocked = lesson.locked || false;
                      const isCompleted = completedLessons.includes(lesson._id);

                      return (
                        <button
                          key={lesson._id}
                          onClick={() => handleLessonClick(lesson)}
                          disabled={isLocked}
                          className={`
                            sidebar-item w-full flex items-center gap-3 p-3 text-left rounded-lg
                            transition-all duration-200
                            ${isCurrentLesson
                              ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/10'
                              : isLocked
                                ? 'opacity-30 cursor-not-allowed text-zinc-550'
                                : 'hover:bg-zinc-900 text-zinc-300'
                            }
                          `}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-zinc-550" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : isCurrentLesson ? (
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-500" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`
                              text-sm font-medium truncate
                              ${isCurrentLesson ? 'text-white' : 'text-zinc-200'}
                            `}>
                              {lesson.title}
                            </p>
                            <p className={`
                              text-xs
                              ${isCurrentLesson ? 'text-white/70' : 'text-zinc-450'}
                            `}>
                              {formatDuration(lesson.duration * 60)}
                            </p>
                          </div>

                          {isCurrentLesson && (
                            <div className="w-1 h-8 bg-white rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}