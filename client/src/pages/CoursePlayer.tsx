import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, ChevronLeft, ChevronRight, Search, FileText, MessageSquare, Notebook, Sparkles, Trophy, CheckSquare, Square, Menu, X } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../store';
import { updateCourseProgress, selectEnrollmentByCourseId } from '../store/enrollmentSlice';
import type { Lesson } from '../api/lessonApi';
import type { Module } from '../api/moduleApi';
import type { Course as ApiCourse } from '../api/courseApi';
import { courseService } from '../services/courseService';
import { moduleService } from '../services/moduleService';
import { lessonService } from '../services/lessonService';
import { VideoPlayer } from './VideoPlayer';

// Local types for the player
interface Chapter {
  id: string;
  title: string;
  lessons: (Lesson & { duration: string } )[];
  
}

interface Course extends ApiCourse {
  chapters: Chapter[];
  lessonsCount: number;
  difficulty: string;
  language: string;
  instructor: string;
}

export const CoursePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const enrollment = useAppSelector(selectEnrollmentByCourseId(''));
  
  const courseProgress = enrollment ? {
    progress: enrollment.progress,
    lastAccessed: enrollment.lastAccessed || '',
    completedLessons: enrollment.completedLessons || []
  } : { progress: 0, lastAccessed: '', completedLessons: [] };

  // States
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'resources' | 'notes' | 'discussion'>('description');
  const [userNote, setUserNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Fetch course and modules data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
  
        const courseResponse = await  courseService.getCourseBySlug(slug);

        const apiCourse = courseResponse;

        const modulesResponse = await moduleService.getModulesByCourse(apiCourse._id);

        const fetchedModules = modulesResponse;

        const modulesWithLessons = await Promise.all(
          fetchedModules.map(async (module) => {
            try {
              const lessonsResponse = await lessonService.getLessonsByModule(module._id);
              return {
                ...module,
                lessons: lessonsResponse ? lessonsResponse : []
              };
            } catch (err) {
              console.error(`Failed to fetch lessons for module ${module._id}:`, err);
              return {
                ...module,
                lessons: []
              };
            }
          })
        );

        const chapters: Chapter[] = modulesWithLessons
          .sort((a, b) => a.order - b.order)
          .map(module => ({
            id: module._id,
            title: module.title,
            lessons: module.lessons
              .sort((a, b) => a.order - b.order)
              .map(lesson => ({
                ...lesson,
                duration: `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}`
              }))
          })) as Chapter[];

        // Calculate total lessons count
        const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

        // Set course data with transformed structure
        const transformedCourse: Course = {
          ...apiCourse,
          chapters,
          lessonsCount: totalLessons,
          difficulty: apiCourse.level.charAt(0).toUpperCase() + apiCourse.level.slice(1),
          language: apiCourse.language,
          instructor: apiCourse.primaryInstructor 
            ? `${apiCourse.primaryInstructor.firstName} ${apiCourse.primaryInstructor.lastName}`
            : 'Instructor'
        };

        setCourse(transformedCourse);
        setModules(modulesWithLessons);

        // Set to first chapter, first lesson by default (or last accessed if we match it)
        let matchedLesson: Lesson | null = null;
        let matchedChapter: Chapter | null = null;

        if (courseProgress.lastAccessed) {
          for (const ch of chapters) {
            const found = ch.lessons.find(l => l.title === courseProgress.lastAccessed || l._id === courseProgress.lastAccessed);
            if (found) {
              matchedLesson = found;
              matchedChapter = ch;
              break;
            }
          }
        }

        if (!matchedLesson && chapters.length > 0) {
          matchedChapter = chapters[0] || null;
          matchedLesson = matchedChapter?.lessons[0] || null;
        }

        setActiveLesson(matchedLesson);
        setActiveChapter(matchedChapter);

      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug, courseProgress.lastAccessed]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-brand-navy">Loading Course...</h2>
        <p className="text-xs text-brand-gray mt-2 font-medium">Fetching modules and lessons from server.</p>
        <div className="mt-6 w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error || !course || !activeLesson || !activeChapter) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-brand-navy">
          {error || 'Course Not Found'}
        </h2>
        <p className="text-xs text-brand-gray mt-2 font-medium">
          {error || 'The course you are looking for does not exist or has been removed.'}
        </p>
        <button
          onClick={() => navigate('/my-learning')}
          className="mt-6 px-6 py-2.5 bg-brand-purple text-white text-xs font-bold rounded-2xl cursor-pointer"
        >
          My Dashboard
        </button>
      </div>
    );
  }

  // Get current progress values
  const progData = {
    progress: courseProgress.progress,
    lastAccessed: courseProgress.lastAccessed,
    completedLessons: courseProgress.completedLessons
  };

  const isCompleted = progData.completedLessons.includes(activeLesson._id);

  // Get flat list of all lessons for easier next/prev navigation
  const allLessons: { lesson: Lesson & { duration: string }; chapter: Chapter }[] = [];
  course.chapters.forEach(ch => {
    ch.lessons.forEach(les => {
      allLessons.push({ lesson: les, chapter: ch });
    });
  });

  const activeIndex = allLessons.findIndex(item => item.lesson._id === activeLesson._id);

  const handleNextLesson = () => {
    if (activeIndex < allLessons.length - 1) {
      const next = allLessons[activeIndex + 1];
      setActiveLesson(next.lesson);
      setActiveChapter(next.chapter);
      // Sync last accessed
      dispatch(updateCourseProgress({
        courseId: course._id,
        lessonId: next.lesson._id,
        progress: progData.progress,
        lastAccessed: next.lesson.title,
        completedLessons: progData.completedLessons
      }));
    }
  };

  const handlePrevLesson = () => {
    if (activeIndex > 0) {
      const prev = allLessons[activeIndex - 1];
      setActiveLesson(prev.lesson);
      setActiveChapter(prev.chapter);
      // Sync last accessed
      dispatch(updateCourseProgress({
        courseId: course._id,
        lessonId: prev.lesson._id,
        progress: progData.progress,
        lastAccessed: prev.lesson.title,
        completedLessons: progData.completedLessons
      }));
    }
  };

  const handleToggleCompleted = () => {
    let newCompleted = [...progData.completedLessons];
    if (isCompleted) {
      newCompleted = newCompleted.filter(id => id !== activeLesson._id);
    } else {
      newCompleted.push(activeLesson._id);
    }

    const newProgress = Math.round((newCompleted.length / course.lessonsCount) * 100);
    dispatch(updateCourseProgress({
      courseId: course._id,
      lessonId: activeLesson._id,
      progress: newProgress,
      lastAccessed: activeLesson.title,
      completedLessons: newCompleted
    }));
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (userNote.trim()) {
      setSavedNotes(prev => [...prev, `${activeLesson.title}: ${userNote}`]);
      setUserNote('');
    }
  };

  // Filter chapters based on search query
  const filteredChapters = course.chapters.map(ch => {
    const matched = ch.lessons.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...ch, lessons: matched };
  }).filter(ch => ch.lessons.length > 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-bg-primary">
      
      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden bg-white border-b border-brand-border px-4 py-3 flex items-center justify-between z-20 shrink-0">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary rounded-xl text-xs font-bold text-brand-navy cursor-pointer"
        >
          <Menu className="w-4 h-4 text-brand-purple" />
          <span>Curriculum Modules</span>
        </button>
        <span className="text-[10px] font-black text-brand-purple">
          Progress: {progData.progress}%
        </span>
      </div>

      {/* Left Sidebar: Curriculum switcher */}
   

      {/* Main Content Area: Player & Tabs */}
      <main className="flex-1 flex flex-col justify-between overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Main Video Block */}
          <div className="w-full bg-black rounded-3xl overflow-hidden aspect-video relative group flex items-center justify-center border border-brand-border premium-shadow">
            {/* Mock video canvas with interactive design */}
         <VideoPlayer src={activeLesson.videoUrl}/>
          </div>

          {/* Navigation Control Bar */}
          <div className="bg-white rounded-2xl border border-brand-border premium-shadow px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevLesson}
                disabled={activeIndex === 0}
                className="px-4 py-2 border border-brand-border hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-brand-navy flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={handleNextLesson}
                disabled={activeIndex === allLessons.length - 1}
                className="px-4 py-2 border border-brand-border hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-brand-navy flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Checkbox toggle */}
            <button
              onClick={handleToggleCompleted}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                isCompleted 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-brand-purple text-white border-transparent hover:opacity-95'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckSquare className="w-4.5 h-4.5 fill-emerald-500/10" />
                  <span>Completed!</span>
                </>
              ) : (
                <>
                  <Square className="w-4.5 h-4.5" />
                  <span>Mark as Completed</span>
                </>
              )}
            </button>
          </div>

          {/* Tabbed Info Panel */}
          <div className="bg-white rounded-3xl border border-brand-border premium-shadow p-6 space-y-6">
            
            {/* Tabs Headers */}
            <div className="flex border-b border-brand-border/60 pb-3 gap-6 overflow-x-auto">
              {[
                { id: 'description', label: 'Description', icon: FileText },
                { id: 'resources', label: 'Resources', icon: Sparkles },
                { id: 'notes', label: 'Notes', icon: Notebook },
                { id: 'discussion', label: 'Discussion', icon: MessageSquare }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer relative transition-colors ${
                    activeTab === tab.id ? 'text-brand-purple' : 'text-brand-gray hover:text-brand-navy'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="playerTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[150px] text-xs leading-relaxed text-brand-gray font-semibold">
              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div
                    key="desc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <h4 className="font-extrabold text-sm text-brand-navy">About this lecture</h4>
                    <p>
                      This lesson covers practical architecture concepts, structuring folders for micro-frontend rules, context hooks, and Zustand setups. Verify your code outcomes.
                    </p>
                    <p className="font-bold">Difficulty: {course.difficulty} • Language: {course.language} • Instructor: {course.instructor}</p>
                  </motion.div>
                )}

                {activeTab === 'resources' && (
                  <motion.div
                    key="res"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <h4 className="font-extrabold text-sm text-brand-navy">Downloadable files</h4>
                    <p className="text-brand-gray">Resources will be available soon. Check with your instructor for downloadable materials.</p>
                  </motion.div>
                )}

                {activeTab === 'notes' && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h4 className="font-extrabold text-sm text-brand-navy">Add private note</h4>
                    <form onSubmit={handleSaveNote} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a note for this lecture..."
                        value={userNote}
                        onChange={(e) => setUserNote(e.target.value)}
                        className="flex-1 px-4 py-2 border border-brand-border rounded-xl focus:border-brand-purple"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-navy text-white font-bold rounded-xl cursor-pointer hover:bg-brand-purple"
                      >
                        Save Note
                      </button>
                    </form>

                    {savedNotes.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h5 className="font-bold text-brand-navy text-[11px]">Saved Notes</h5>
                        <ul className="space-y-2">
                          {savedNotes.map((note, idx) => (
                            <li key={idx} className="p-3 bg-bg-secondary rounded-xl border border-brand-border/60 flex items-start gap-2">
                              <Notebook className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'discussion' && (
                  <motion.div
                    key="disc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h4 className="font-extrabold text-sm text-brand-navy">Q&A discussion board</h4>
                    <div className="p-4 bg-bg-secondary rounded-2xl border border-brand-border/60 space-y-3">
                      <div className="flex gap-2.5 items-center">
                        <div className="w-7 h-7 rounded-full bg-brand-purple/10 flex items-center justify-center font-bold text-brand-purple">VM</div>
                        <div>
                          <p className="font-extrabold text-brand-navy">Vikram Mehta</p>
                          <p className="text-[9px] text-brand-gray">Posted 2 days ago</p>
                        </div>
                      </div>
                      <p className="pl-9.5">
                        Is there a vector db comparison guide for the Langchain agents module? The setups are highly interesting.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </main>
   <aside className={`w-80 border-r border-brand-border bg-white flex flex-col justify-between shrink-0 z-30 transition-transform duration-300 lg:translate-x-0 lg:static fixed inset-y-0 left-0 ${
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-brand-border/60 space-y-3 relative shrink-0">
            <div className="flex justify-between items-center">
              <Link to="/my-learning" className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <button 
                onClick={() => setShowMobileSidebar(false)}
                className="lg:hidden p-1 rounded-full hover:bg-bg-secondary text-brand-gray cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-extrabold text-sm text-brand-navy truncate">{course.title}</h3>
            
            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-brand-navy">
                <span>Course Progress</span>
                <span>{progData.progress}%</span>
              </div>
              <div className="w-full h-1 bg-bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                  style={{ width: `${progData.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Search lessons */}
          <div className="p-3 border-b border-brand-border/40 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-gray" />
              <input
                type="text"
                placeholder="Search lectures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-bg-secondary border border-transparent rounded-xl text-xs font-semibold focus:bg-white"
              />
            </div>
          </div>

          {/* Curriculum Accordion List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredChapters.map((chapter) => (
              <div key={chapter.id} className="space-y-1">
                <p className="text-[9px] font-bold text-brand-gray uppercase tracking-wider px-2">
                  {chapter.title}
                </p>
                
                <div className="space-y-0.5">
                  {chapter.lessons.map((les) => {
                    const isSelected = les._id === activeLesson._id;
                    const isLesCompleted = progData.completedLessons.includes(les._id);
                    
                    return (
                      <button
                        key={les._id}
                        onClick={() => {
                          setActiveLesson(les);
                          setActiveChapter(chapter);
                          setShowMobileSidebar(false);
                          dispatch(updateCourseProgress({
                            courseId: course._id,
                            lessonId: les._id,
                            progress: progData.progress,
                            lastAccessed: les.title,
                            completedLessons: progData.completedLessons
                          }));
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-brand-purple/10 text-brand-purple font-bold'
                            : 'hover:bg-bg-secondary text-brand-navy font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isLesCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Play className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-brand-purple' : 'text-brand-gray'}`} />
                          )}
                          <span className="truncate leading-tight">{les.title}</span>
                        </div>
                        <span className="text-[9px] text-brand-gray shrink-0">{les.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </aside>
    </div>
  );
};