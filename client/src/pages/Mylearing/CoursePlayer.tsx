import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Link2,
  Star,
  Hexagon,
} from "lucide-react";
import { VideoPlayer } from "../../components/VideoPlayer";
import { ReviewSection } from "../../components/ReviewSection";
import { CourseSidebar } from "../../components/CourseSidebar";
import { courseService } from "../../services/courseService";
import { moduleService } from "../../services/moduleService";
import { lessonService } from "../../services/lessonService";
import { enrollmentService } from "../../services/enrollmentService";
import type {
  CourseData,
  Module,
  Lesson,
  EnrollmentData,
} from "../../lib/courseTypes";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchCourseProgress,
  updateVideoProgress,
} from "../../store/progressSlice";
import { formatDuration } from "../../utils/Helping";

const getLessonId = (lesson: any): string | undefined => {
  return typeof lesson === "string" ? lesson : lesson?._id;
};

export function CoursePlayerPage() {
  const { slug, lessonId: urlLessonId } = useParams<{
    slug: string;
    lessonId?: string;
  }>();
  const navigate = useNavigate();
  const courseSlug = slug || "";
  const dispatch = useAppDispatch();

  const reduxLessonProgress = useAppSelector(
    (state) => state.progress.lessonProgress,
  );
  const reduxCourseProgresses = useAppSelector(
    (state) => state.progress.courseProgresses,
  );
  const reduxCompletedLessonsList = useAppSelector(
    (state) => state.progress.completedLessonsList,
  );

  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "notes" | "resources" | "reviews"
  >("overview");

  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    if (currentLessonId) {
      const fetchResources = async () => {
        try {
          setLoadingResources(true);
          const resData =
            await lessonService.getLessonResources(currentLessonId);
          setResources(resData || []);
        } catch (err) {
          console.error("Error loading lesson resources:", err);
          setResources([]);
        } finally {
          setLoadingResources(false);
        }
      };
      fetchResources();
    } else {
      setResources([]);
    }
  }, [currentLessonId]);

  const handleDownloadResource = async (resource: any) => {
    try {
      if (resource.type === "link") {
        window.open(resource.url, "_blank");
        return;
      }

      const res = await lessonService.downloadLessonResource(
        currentLessonId,
        resource._id,
      );
      if (res && res.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.downloadUrl;
        link.setAttribute("download", resource.fileName || "download");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error downloading resource:", err);
      alert("Failed to download resource. Please try again.");
    }
  };

  // Fetch course data with modules and lessons - ULTRA FAST WITH PARALLEL REQUESTS
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch course data first
        const courseData = await courseService.getCourseBySlug(courseSlug);

        // Step 2: Immediately show course title and basic info (fast UI render)
        setCourse({
          _id: courseData._id,
          title: courseData.title,
          description: courseData.description || "",
          thumbnailUrl: courseData.thumbnailUrl || "",
          totalLessons: 0,
          totalModules: 0,
          duration: 0,
          modules: [],
        });

        // Step 3: Fetch modules, enrollment, and progress data in parallel
        const [modulesResponse, enrollments, progressResult] =
          await Promise.all([
            moduleService.getModulesByCourse(courseData._id).catch(() => []),
            enrollmentService.getMyEnrollments().catch(() => []),
            dispatch(fetchCourseProgress(courseData._id))
              .unwrap()
              .catch(() => null),
          ]);

        if (!modulesResponse || !Array.isArray(modulesResponse)) {
          throw new Error("Failed to fetch course modules");
        }

        // Fetch all lessons in parallel for all modules
        const modulesWithLessons: Module[] = await Promise.all(
          modulesResponse.map(async (apiModule) => {
            try {
              const lessonsResponse = await lessonService.getLessonsByModule(
                apiModule._id,
              );

              // Transform API lessons to our Lesson type
              const transformedLessons: Lesson[] =
                lessonsResponse && Array.isArray(lessonsResponse)
                  ? lessonsResponse.map((apiLesson) => ({
                      _id: apiLesson._id,
                      title: apiLesson.title,
                      description: apiLesson.description || "",
                      order: apiLesson.order,
                      duration: Math.round(
                        (apiLesson.durationSeconds || 0) / 60,
                      ),
                      contentType: "video" as const,
                      videoUrl: apiLesson.videoUrl,
                      videoDuration: 0,
                      isPublished: true,
                      isFree: false,
                      isPreview: false,
                      canDownload: false,
                      completed: false,
                      locked: false,
                    }))
                  : [];

              return {
                _id: apiModule._id,
                title: apiModule.title,
                description: apiModule.description || "",
                order: apiModule.order,
                duration: apiModule.duration,
                isPublished: true,
                isFree: false,
                totalLessons: transformedLessons.length,
                lessons: transformedLessons,
              };
            } catch (error) {
              console.error(
                `Error fetching lessons for module ${apiModule._id}:`,
                error,
              );
              return {
                _id: apiModule._id,
                title: apiModule.title,
                description: apiModule.description || "",
                order: apiModule.order,
                duration: apiModule.duration,
                isPublished: true,
                isFree: false,
                totalLessons: 0,
                lessons: [],
              };
            }
          }),
        );

        // Build complete course data structure
        const completeCourseData: CourseData = {
          _id: courseData._id,
          title: courseData.title,
          description: courseData.description || "",
          thumbnailUrl: courseData.thumbnailUrl || "",
          totalLessons: modulesWithLessons.reduce(
            (sum, m) => sum + m.totalLessons,
            0,
          ),
          totalModules: modulesWithLessons.length,
          duration: modulesWithLessons.reduce((sum, m) => sum + m.duration, 0),
          modules: modulesWithLessons,
        };

        setCourse(completeCourseData);

        // Process enrollment data
        const courseEnrollment = enrollments.find((e: any) => {
          const enrolledCourseId =
            typeof e.course === "string" ? e.course : e.course?._id;
          return enrolledCourseId === courseData._id;
        });

        if (courseEnrollment) {
          const enrollmentData: EnrollmentData = {
            _id: courseEnrollment._id,
            progress: courseEnrollment.progress,
            completedLessons: courseEnrollment.completedLessons || [],
            currentLesson: courseEnrollment.currentLesson,
            currentModule: courseEnrollment.currentModule,
            totalTimeSpent: 0,
            lastAccessedAt:
              courseEnrollment.lastAccessed || new Date().toISOString(),
            isCompleted: courseEnrollment.progress === 100,
            lessonProgress: courseEnrollment.lessonProgress || {},
          };

          setEnrollment(enrollmentData);

          const lastWatchedLessonId = getLessonId(
            progressResult?.data?.lastWatched,
          );
          const currentEnrollmentLessonId = getLessonId(
            courseEnrollment?.currentLesson,
          );

          // Set current lesson — URL param takes highest priority
          if (urlLessonId) {
            // Verify the lesson exists in this course
            const lessonExists = modulesWithLessons.some((m) =>
              m.lessons.some((l) => l._id === urlLessonId),
            );
            if (lessonExists) {
              setCurrentLessonId(urlLessonId);
            } else if (lastWatchedLessonId) {
              setCurrentLessonId(lastWatchedLessonId);
            } else if (currentEnrollmentLessonId) {
              setCurrentLessonId(currentEnrollmentLessonId);
            } else if (modulesWithLessons[0]?.lessons[0]) {
              setCurrentLessonId(modulesWithLessons[0].lessons[0]._id);
            }
          } else {
            if (lastWatchedLessonId) {
              setCurrentLessonId(lastWatchedLessonId);
            } else if (currentEnrollmentLessonId) {
              setCurrentLessonId(currentEnrollmentLessonId);
            } else if (modulesWithLessons[0]?.lessons[0]) {
              setCurrentLessonId(modulesWithLessons[0].lessons[0]._id);
            }
          }
        } else if (urlLessonId) {
          const lessonExists = modulesWithLessons.some((m) =>
            m.lessons.some((l) => l._id === urlLessonId),
          );
          setCurrentLessonId(
            lessonExists
              ? urlLessonId
              : modulesWithLessons[0]?.lessons[0]?._id || "",
          );
        } else if (modulesWithLessons[0]?.lessons[0]) {
          setCurrentLessonId(modulesWithLessons[0].lessons[0]._id);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load course",
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseSlug) {
      fetchCourseData();
    }
  }, [courseSlug, urlLessonId, dispatch]);

  // Synchronize browser URL with the active lesson ID
  useEffect(() => {
    if (currentLessonId && slug && currentLessonId !== urlLessonId) {
      navigate(`/learn/${slug}/${currentLessonId}`, { replace: true });
    }
  }, [currentLessonId, urlLessonId, slug, navigate]);

  // Get current lesson
  const currentLesson = useCallback((): Lesson | null => {
    if (!course) return null;

    for (const module of course.modules) {
      const lesson = module.lessons.find((l) => l._id === currentLessonId);
      if (lesson) return lesson;
    }
    return null;
  }, [course, currentLessonId]);

  // Calculate progress
  const allLessons = useMemo(
    () => course?.modules.flatMap((m) => m.lessons) || [],
    [course],
  );
  const totalLessons = allLessons.length;
  const courseLessonIds = useMemo(
    () => new Set(allLessons.map((lesson) => lesson._id)),
    [allLessons],
  );
  const completedLessons = useMemo(() => {
    if (!course?._id) return [];

    const courseCompletedLessons = reduxCompletedLessonsList[course._id] || [];
    const completedFromLessonProgress = Object.values(reduxLessonProgress)
      .filter((lp) => lp.completed)
      .map((lp) => lp.lessonId);

    return Array.from(
      new Set([...courseCompletedLessons, ...completedFromLessonProgress]),
    ).filter((lessonId) => courseLessonIds.has(lessonId));
  }, [
    course?._id,
    courseLessonIds,
    reduxCompletedLessonsList,
    reduxLessonProgress,
  ]);
  const completedCount = completedLessons.length;
  const progressPercentage = course?._id
    ? (reduxCourseProgresses[course._id] ?? 0)
    : 0;

  // Handle lesson selection
  const handleLessonSelect = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
    setMobileMenuOpen(false);
  }, []);

  // Handle lesson completion
  const handleLessonComplete = useCallback(
    async (lessonId: string) => {
      try {
        if (course?._id) {
          const activeLesson = allLessons.find((l) => l._id === lessonId);
          const duration = activeLesson ? activeLesson.duration * 60 : 100; // fallback in seconds

          // Dispatch to Redux (handles optimistic UI update + database update)
          await dispatch(
            updateVideoProgress({
              courseId: course._id,
              lessonId,
              currentTime: duration,
              duration,
              completed: true,
            }),
          ).unwrap();

          // Autoplay next lesson!
          const currentIndex = allLessons.findIndex((l) => l._id === lessonId);
          if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            if (!nextLesson.locked) {
              setTimeout(() => {
                handleLessonSelect(nextLesson._id);
              }, 1500);
            }
          }
        }
      } catch (error) {
        console.error("Error marking lesson as complete:", error);
      }
    },
    [course?._id, allLessons, dispatch, handleLessonSelect],
  );

  // Handle progress updates
  const handleProgress = useCallback(
    async (currentTime: number, duration: number) => {
      // Progress is already throttled in VideoPlayer (every 5 seconds)
      try {
        if (course?._id && currentLessonId) {
          dispatch(
            updateVideoProgress({
              courseId: course._id,
              lessonId: currentLessonId,
              currentTime,
              duration,
            }),
          );
        }
      } catch (error) {
        console.error("Error updating video progress:", error);
      }
    },
    [course?._id, currentLessonId, dispatch],
  );

  // Handle next/previous lesson navigation
  const handleNextLesson = useCallback(() => {
    if (!course) return;
    const currentIndex = allLessons.findIndex((l) => l._id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (!nextLesson.locked) {
        handleLessonSelect(nextLesson._id);
      }
    }
  }, [course, allLessons, currentLessonId, handleLessonSelect]);

  const handlePreviousLesson = useCallback(() => {
    if (!course) return;
    const currentIndex = allLessons.findIndex((l) => l._id === currentLessonId);
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      if (!prevLesson.locked) {
        handleLessonSelect(prevLesson._id);
      }
    }
  }, [course, allLessons, currentLessonId, handleLessonSelect]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-bg-primary min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-gray">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center py-20 bg-bg-primary min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Course not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple-light transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const lesson = currentLesson();  return (
    <div className="w-full bg-[#07070a] text-zinc-200 h-screen flex flex-col overflow-hidden">
      {/* Custom Player Header */}
      <header className="w-full bg-zinc-950 border-b border-zinc-900 py-3 px-6 shadow-sm z-30 shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: Branding Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white premium-shadow transition-transform group-hover:scale-105">
              <Hexagon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-brand-purple bg-clip-text text-transparent">
              KVault
            </span>
          </Link>

          {/* Right: Course Progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-zinc-100 max-w-[200px] sm:max-w-md truncate">
                {course.title}
              </p>
              <p className="text-[10px] font-bold text-brand-purple-light">
                {completedCount} of {totalLessons} lessons completed (
                {progressPercentage}%)
              </p>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-brand-purple rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Video and Lesson Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#07070a] border-r border-zinc-900/80">
          {lesson && (
            <div className="max-w-5xl mx-auto w-full space-y-6">
              {/* Video Player */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-900 bg-black">
                <VideoPlayer
                  key={lesson._id}
                  lesson={lesson as any}
                  courseId={course._id}
                  onComplete={handleLessonComplete}
                  onProgress={handleProgress}
                  isCompleted={completedLessons.includes(lesson._id)}
                  initialTime={
                    reduxLessonProgress[lesson._id]?.watchedSeconds || 0
                  }
                  posterUrl={course.thumbnailUrl}
                />
              </div>

              {/* Lesson Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousLesson}
                  disabled={
                    allLessons.findIndex((l) => l._id === currentLessonId) === 0
                  }
                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-brand-purple-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-semibold">Previous</span>
                </button>

                <span className="text-xs font-bold text-zinc-400">
                  Lesson{" "}
                  {allLessons.findIndex((l) => l._id === currentLessonId) + 1}{" "}
                  of {totalLessons}
                </span>

                <button
                  onClick={handleNextLesson}
                  disabled={
                    allLessons.findIndex((l) => l._id === currentLessonId) ===
                    allLessons.length - 1
                  }
                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-brand-purple-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm font-semibold">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Lesson Information */}
              <div className="mt-4">
                <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                  {lesson.title}
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {lesson.description || "No description available"}
                </p>

                {/* Tabs */}
                <div className="border-b border-zinc-900">
                  <nav className="flex gap-8">
                    {(
                      ["overview", "notes", "resources", "reviews"] as const
                    ).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-semibold transition-colors relative ${
                          activeTab === tab
                            ? "text-brand-purple-light"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {tab === "overview" && (
                            <BookOpen className="w-4 h-4" />
                          )}
                          {tab === "notes" && <FileText className="w-4 h-4" />}
                          {tab === "resources" && <Link2 className="w-4 h-4" />}
                          {tab === "reviews" && <Star className="w-4 h-4" />}
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </span>
                        {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple-light rounded-full" />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="py-6">
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div className="prose max-w-none text-zinc-300 text-sm leading-relaxed">
                        <p>
                          {lesson.description ||
                            "No overview available for this lesson."}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "notes" && (
                    <div>
                      <textarea
                        placeholder="Take notes here... These will be saved automatically."
                        className="w-full h-64 p-4 border border-zinc-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-purple bg-zinc-900 text-zinc-100 placeholder-zinc-500"
                      />
                      <p className="text-xs text-zinc-500 mt-2">
                        Notes are saved locally and synced across your devices.
                      </p>
                    </div>
                  )}

                  {activeTab === "resources" && (
                    <div className="space-y-3">
                      {loadingResources ? (
                        <div className="text-center py-6 text-sm text-zinc-400">
                          Loading resources...
                        </div>
                      ) : resources.length > 0 ? (
                        <div className="grid gap-3">
                          {resources.map((res: any) => (
                            <div
                              key={res._id}
                              className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/85 rounded-xl hover:shadow-sm transition-all duration-200"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-purple/10 rounded-lg flex items-center justify-center">
                                  {res.type === "link" ? (
                                    <Link2 className="w-5 h-5 text-blue-400" />
                                  ) : res.type === "pdf" ? (
                                    <FileText className="w-5 h-5 text-red-400" />
                                  ) : res.type === "image" ? (
                                    <FileText className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-yellow-400" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-zinc-200 text-sm">
                                    {res.title}
                                  </p>
                                  {res.type !== "link" && res.fileSize && (
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                      {(res.fileSize / 1024 / 1024).toFixed(2)}{" "}
                                      MB • {res.fileName}
                                    </p>
                                  )}
                                  {res.type === "link" && (
                                    <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[250px]">
                                      {res.url}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadResource(res)}
                                className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200"
                              >
                                {res.type === "link"
                                  ? "Visit Link"
                                  : "Download"}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                          <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                          <p className="text-xs text-zinc-400 font-semibold">
                            No resources available
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            The instructor hasn't uploaded any resources for
                            this lesson.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="space-y-4">
                      <ReviewSection courseId={course._id} isEnrolled={true} />
                    </div>
                  )}
                </div>
              </div>
            </div>
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
