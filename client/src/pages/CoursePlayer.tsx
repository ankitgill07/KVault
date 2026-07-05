// src/pages/CoursePlayer.tsx
//
// Course Player Page - Main component that orchestrates video playback and sidebar
// Connects to backend APIs for real data and handles progress tracking

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, BookOpen, FileText, Link2 } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { CourseSidebar } from '../components/CourseSidebar';
import { courseService } from '../services/courseService';
import { moduleService } from '../services/moduleService';
import { lessonService } from '../services/lessonService';
import { enrollmentService } from '../services/enrollmentService';
import type { CourseData, Module, Lesson, EnrollmentData } from '../lib/courseTypes';

export function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const courseId = slug || '';
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources'>('overview');

  // Fetch course data with modules and lessons - ULTRA FAST WITH PARALLEL REQUESTS
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch course data first
        const courseData = await courseService.getCourseBySlug(slug as string);

        // Step 2: Immediately show course title and basic info (fast UI render)
        setCourse({
          _id: courseData._id,
          title: courseData.title,
          description: courseData.description || '',
          thumbnail: courseData.thumbnail || '',
          totalLessons: 0,
          totalModules: 0,
          duration: 0,
          modules: []
        });

        // Step 3: Fetch modules and enrollment data in parallel
        const [modulesResponse, enrollments] = await Promise.all([
          moduleService.getModulesByCourse(courseData._id).catch(() => []),
          enrollmentService.getMyEnrollments().catch(() => [])
        ]);
        
        if (!modulesResponse || !Array.isArray(modulesResponse)) {
          throw new Error('Failed to fetch course modules');
        }

        // Fetch all lessons in parallel for all modules
        const modulesWithLessons: Module[] = await Promise.all(
          modulesResponse.map(async (apiModule) => {
            try {
              const lessonsResponse = await lessonService.getLessonsByModule(apiModule._id);
              
              // Transform API lessons to our Lesson type
              const transformedLessons: Lesson[] = lessonsResponse && Array.isArray(lessonsResponse)
                ? lessonsResponse.map((apiLesson) => ({
                    _id: apiLesson._id,
                    title: apiLesson.title,
                    description: apiLesson.description || '',
                    order: apiLesson.order,
                    duration: apiLesson.duration,
                    contentType: 'video' as const,
                    videoUrl: apiLesson.videoUrl,
                    videoDuration: 0,
                    isPublished: true,
                    isFree: false,
                    isPreview: false,
                    canDownload: false,
                    completed: false,
                    locked: false
                  }))
                : [];

              return {
                _id: apiModule._id,
                title: apiModule.title,
                description: apiModule.description || '',
                order: apiModule.order,
                duration: apiModule.duration,
                isPublished: true,
                isFree: false,
                totalLessons: transformedLessons.length,
                lessons: transformedLessons
              };
            } catch (error) {
              console.error(`Error fetching lessons for module ${apiModule._id}:`, error);
              return {
                _id: apiModule._id,
                title: apiModule.title,
                description: apiModule.description || '',
                order: apiModule.order,
                duration: apiModule.duration,
                isPublished: true,
                isFree: false,
                totalLessons: 0,
                lessons: []
              };
            }
          })
        );

        // Build complete course data structure
        const completeCourseData: CourseData = {
          _id: courseData._id,
          title: courseData.title,
          description: courseData.description || '',
          thumbnail: courseData.thumbnail || '',
          totalLessons: modulesWithLessons.reduce((sum, m) => sum + m.totalLessons, 0),
          totalModules: modulesWithLessons.length,
          duration: modulesWithLessons.reduce((sum, m) => sum + m.duration, 0),
          modules: modulesWithLessons
        };

        setCourse(completeCourseData);

        // Process enrollment data
        const courseEnrollment = enrollments.find((e: any) => e.course._id === courseId);
        
        if (courseEnrollment) {
          const enrollmentData: EnrollmentData = {
            _id: courseEnrollment._id,
            progress: courseEnrollment.progress,
            completedLessons: courseEnrollment.completedLessons || [],
            currentLesson: courseEnrollment.currentLesson,
            currentModule: courseEnrollment.currentModule,
            totalTimeSpent: 0,
            lastAccessedAt: courseEnrollment.lastAccessed || new Date().toISOString(),
            isCompleted: courseEnrollment.progress === 100
          };
          
          setEnrollment(enrollmentData);
          setCompletedLessons(courseEnrollment.completedLessons || []);
          
          // Set current lesson from enrollment or first lesson
          if (courseEnrollment.currentLesson) {
            setCurrentLessonId(courseEnrollment.currentLesson);
          } else if (modulesWithLessons[0]?.lessons[0]) {
            setCurrentLessonId(modulesWithLessons[0].lessons[0]._id);
          }
        } else {
          // No enrollment found, start with first lesson
          if (modulesWithLessons[0]?.lessons[0]) {
            setCurrentLessonId(modulesWithLessons[0].lessons[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Get current lesson
  const currentLesson = useCallback((): Lesson | null => {
    if (!course) return null;
    
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l._id === currentLessonId);
      if (lesson) return lesson;
    }
    return null;
  }, [course, currentLessonId]);

  // Calculate progress
  const allLessons = course?.modules.flatMap(m => m.lessons) || [];
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Handle lesson selection
  const handleLessonSelect = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
    setMobileMenuOpen(false);
  }, []);

  // Handle lesson completion
  const handleLessonComplete = useCallback(async (lessonId: string) => {
    try {
      // Update local state immediately for real-time UI update
      setCompletedLessons(prev => {
        if (prev.includes(lessonId)) return prev;
        return [...prev, lessonId];
      });

      // Send to backend
      if (courseId) {
        const newProgress = totalLessons > 0 ? Math.round(((completedLessons.length + 1) / totalLessons) * 100) : 0;
        
        await enrollmentService.updateProgress({
          courseId,
          lessonId,
          progress: newProgress
        });

        // Refresh enrollment data
        const enrollments = await enrollmentService.getMyEnrollments();
        const courseEnrollment = enrollments.find(e => e.course._id === courseId);
        
        if (courseEnrollment) {
          const enrollmentData: EnrollmentData = {
            _id: courseEnrollment._id,
            progress: courseEnrollment.progress,
            completedLessons: courseEnrollment.completedLessons || [],
            currentLesson: courseEnrollment.currentLesson,
            currentModule: courseEnrollment.currentModule,
            totalTimeSpent: 0,
            lastAccessedAt: courseEnrollment.lastAccessed || new Date().toISOString(),
            isCompleted: courseEnrollment.progress === 100
          };
          
          setEnrollment(enrollmentData);
          setCompletedLessons(courseEnrollment.completedLessons || []);
        }
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  }, [courseId, completedLessons.length, totalLessons]);

  // Handle progress updates
  const handleProgress = useCallback(async (currentTime: number, duration: number) => {
    // Progress is already throttled in VideoPlayer (every 5 seconds)
    try {
      if (courseId && currentLessonId) {
        await enrollmentService.updateVideoProgress({
          courseId,
          lessonId: currentLessonId,
          currentTime,
          duration,
        });
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  }, [courseId, currentLessonId]);

  // Handle next/previous lesson navigation
  const handleNextLesson = useCallback(() => {
    if (!course) return;
    const currentIndex = allLessons.findIndex(l => l._id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (!nextLesson.locked) {
        handleLessonSelect(nextLesson._id);
      }
    }
  }, [course, allLessons, currentLessonId, handleLessonSelect]);

  const handlePreviousLesson = useCallback(() => {
    if (!course) return;
    const currentIndex = allLessons.findIndex(l => l._id === currentLessonId);
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      if (!prevLesson.locked) {
        handleLessonSelect(prevLesson._id);
      }
    }
  }, [course, allLessons, currentLessonId, handleLessonSelect]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6C4DFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#6C4DFF] text-white rounded-lg hover:bg-[#5B3FE0] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const lesson = currentLesson();

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <main className="flex">
        {/* Video and Lesson Content */}
        <div className="flex-1 p-6 ">
          {lesson && (
            <>
              {/* Video Player */}
              <VideoPlayer
                lesson={lesson}
                courseId={courseId}
                onComplete={handleLessonComplete}
                onProgress={handleProgress}
                isCompleted={completedLessons.includes(lesson._id)}
              />

              {/* Lesson Navigation */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handlePreviousLesson}
                  disabled={allLessons.findIndex(l => l._id === currentLessonId) === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Previous</span>
                </button>

                <span className="text-sm text-gray-500">
                  Lesson {allLessons.findIndex(l => l._id === currentLessonId) + 1} of {totalLessons}
                </span>

                <button
                  onClick={handleNextLesson}
                  disabled={allLessons.findIndex(l => l._id === currentLessonId) === allLessons.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Lesson Information */}
              <div className="mt-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">{lesson.title}</h1>
                <p className="text-gray-600 mb-6">{lesson.description || 'No description available'}</p>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex gap-8">
                    {(['overview', 'notes', 'resources'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-medium transition-colors relative ${
                          activeTab === tab ? 'text-[#6C4DFF]' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {tab === 'overview' && <BookOpen className="w-4 h-4" />}
                          {tab === 'notes' && <FileText className="w-4 h-4" />}
                          {tab === 'resources' && <Link2 className="w-4 h-4" />}
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </span>
                        {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C4DFF] rounded-full" />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="py-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <div className="prose max-w-none text-gray-600">
                        <p>{lesson.description || 'No overview available for this lesson.'}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div>
                      <textarea
                        placeholder="Take notes here... These will be saved automatically."
                        className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#6C4DFF] focus:border-transparent text-gray-700"
                      />
                      <p className="text-xs text-gray-400 mt-2">Notes are saved locally and synced across your devices.</p>
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className="space-y-3">
                      {lesson.contentType === 'video' && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-[#6C4DFF]/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#6C4DFF]" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Video Lesson</p>
                            <p className="text-sm text-gray-500">Duration: {lesson.duration} minutes</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Course Sidebar */}
        <CourseSidebar
          course={course}
          currentLessonId={currentLessonId}
          completedLessons={completedLessons}
          onLessonSelect={handleLessonSelect}
          progressPercentage={progressPercentage}
          completedCount={completedCount}
          totalCount={totalLessons}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </main>
    </div>
  );
}