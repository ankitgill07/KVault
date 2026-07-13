import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Globe,
  Clock,
  Award,
  Smartphone,
  Infinity as InfinityIcon,
  Play,
  ChevronDown,
  Check,
  User,
  Globe as GlobeIcon,
  Heart,
  ShoppingBag,
  Loader2,
  X,
} from "lucide-react";
import { courseService } from "../services/courseService";
import { moduleService } from "../services/moduleService";
import { lessonService } from "../services/lessonService";
import type { Course } from "../api/courseApi";
import type { Module } from "../api/moduleApi";
import type { Lesson } from "../api/lessonApi";
import type { AppDispatch } from "../store";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  selectIsInCart,
} from "../store/cartSlice";
import {
  addToWishlist as addToWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  selectIsInWishlist,
} from "../store/wishlistSlice";
import {
  fetchMyEnrollments,
  selectEnrollmentByCourseId,
} from "../store/enrollmentSlice";
import { useDispatch, useSelector } from "react-redux";
import { VideoPlayer } from "../components/VideoPlayer";
import { formatDuration } from "../utils/Helping";
import { useUser } from "../context/UserContext";
import { getCoursePlayerPath } from "../routes/routeConfig";

const getLessonId = (lesson: unknown): string | undefined => {
  return typeof lesson === "string" ? lesson : (lesson as any)?._id;
};

export const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const [course, setCourse] = useState<Course>({} as Course);
  const [chapters, setChapters] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const inCart = useSelector(selectIsInCart(course._id));
  const inWishlist = useSelector(selectIsInWishlist(course._id));
  const enrollment = useSelector(selectEnrollmentByCourseId(course._id));
  const isEnrolled = !!enrollment;
  // Accordion curriculum control state (module active ids)
  const [activeModules, setActiveModules] = useState<string[]>([]);

  // Video player state - track the preview lesson object
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Stub functions for preview mode (no progress/completion tracking needed)
  const handlePreviewComplete = async (lessonId: string) => {
    // No-op for preview - we don't track completion in preview mode
    console.log("Preview completed for lesson:", lessonId);
  };

  const handlePreviewProgress = async (
    currentTime: number,
    duration: number,
  ) => {
    // No-op for preview - we don't track progress in preview mode
    console.log("Preview progress:", currentTime, duration);
  };

  useEffect(() => {
    if (slug) {
      fetchCourseDetail(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (isSignedIn) {
      dispatch(fetchMyEnrollments());
    }
  }, [dispatch, isSignedIn]);

  const handleWishlistClick = async () => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    if (inWishlist) {
      dispatch(removeFromWishlistAction(course._id));
    } else {
      dispatch(addToWishlistAction(course._id));
    }
  };

  const handleCartClick = async () => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    if (inCart) {
      dispatch(removeFromCartAction(course._id));
    } else {
      dispatch(addToCartAction(course._id));
    }
  };

  const handleBuyNow = async () => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    try {
      if (!inCart) {
        await dispatch(addToCartAction(course._id));
      }
      navigate("/cart");
    } catch (err: any) {
      console.error("Error adding to cart:", err);
    }
  };

  const firstLessonId = getLessonId(chapters[0]?.lessons?.[0]);
  const continueLessonId = getLessonId(enrollment?.currentLesson) || firstLessonId;
  const continueLearningPath = getCoursePlayerPath(course.slug, continueLessonId);

  const handleContinueLearning = () => {
    navigate(continueLearningPath);
  };

  const fetchCourseDetail = async (courseSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course data
      const courseResponse = await courseService.getCourseBySlug(courseSlug);

      const courseData: Course = courseResponse;
      console.log(courseData);

      setCourse(courseData);

      // Fetch modules for this course
      const modulesResponse = await moduleService.getModulesByCourse(
        courseData._id,
      );
      const modules: Module[] = modulesResponse || [];

      // Sort modules by order
      modules.sort((a, b) => a.order - b.order);

      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          try {
            const lessonsResponse = await lessonService.getLessonsByModule(
              module._id,
            );
            const lessons: Lesson[] = (lessonsResponse || []).sort(
              (a: Lesson, b: Lesson) => a.order - b.order,
            );
            return { ...module, lessons };
          } catch (error) {
            console.error(
              `Error fetching lessons for module ${module._id}:`,
              error,
            );
            return { ...module, lessons: [] };
          }
        }),
      );

      setChapters(modulesWithLessons);

      // Open first module by default
      if (modulesWithLessons.length > 0) {
        setActiveModules([modulesWithLessons[0]._id]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch course details");
      console.error("Error fetching course detail:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-purple mx-auto" />
        <p className="text-sm text-brand-gray mt-4 font-semibold">
          Loading course details...
        </p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-brand-navy">
          Course Not Found
        </h2>
        <p className="text-xs text-brand-gray mt-2 font-semibold">
          {error || "The requested learning course could not be located."}
        </p>
        <button
          onClick={() => navigate("/courses")}
          className="mt-6 px-6 py-2.5 bg-brand-purple text-white text-xs font-bold rounded-2xl cursor-pointer"
        >
          View All Courses
        </button>
      </div>
    );
  }

  const displayPrice = course.discountPrice || course.price;
  const categoryName =
    typeof course.category === "object" && course.category?.name
      ? course.category.name
      : "General";

  const toggleModule = (id: string) => {
    setActiveModules((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
    );
  };

  const handlePlayLesson = (lesson: Lesson) => {
    if (lesson.isPreview && lesson.videoUrl) {
      setPreviewLesson(lesson);
      setIsPlaying(true);
    }
  };

  const handleCloseVideo = () => {
    setIsPlaying(false);
    setPreviewLesson(null);
  };

  // Fetch instructor details from course primaryInstructor
  const instructorName =
    course.primaryInstructor && typeof course.primaryInstructor === "object"
      ? course.primaryInstructor.name
      : "Instructor";
  const instructorRole = "Expert Instructor";
  const instructorBio =
    course.primaryInstructor &&
    typeof course.primaryInstructor === "object" &&
    course.primaryInstructor.bio
      ? course.primaryInstructor.bio
      : "Learn from the best in the industry.";
  const instructorAvatar =
    course.primaryInstructor &&
    typeof course.primaryInstructor === "object" &&
    course.primaryInstructor.avatar
      ? course.primaryInstructor.avatar
      : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full relative">
      {/* Main Course Header / Hero Block */}
      <div className="mt-4 mb-12 bg-[#111827] dark:bg-bg-card text-white rounded-[32px] p-6 sm:p-10 relative overflow-hidden border border-transparent dark:border-brand-border premium-shadow">
        {/* Decorative Light Glows */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-brand-blue/15 rounded-full blur-[80px]"></div>

        <div className="max-w-4xl relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30 text-xs font-bold rounded-full uppercase tracking-wider">
              {categoryName}
            </span>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                course.level === "Beginner"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : course.level === "Intermediate"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {course.level}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl">
            {course.title}
          </h1>

          <p className="text-sm sm:text-base text-white/80 line-clamp-3 font-medium leading-relaxed max-w-2xl">
            {course.description}
          </p>

          {/* Quick stats / metadata */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold text-white/70">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
              <span className="text-white font-extrabold">
                {course.rating.toFixed(1)}
              </span>
              <span>({course.reviewCount} reviews)</span>
            </div>
            <div>•</div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-purple-light" />
              <span>By {instructorName}</span>
            </div>
            <div>•</div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-blue-light" />
              <span>{course.language}</span>
            </div>
            <div>•</div>
            <div className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] text-white">
              {course.enrollmentCount} Students Enrolled
            </div>
          </div>

          {/* CTAs on Mobile (Hidden on Desktop because of Sticky Card) */}
          <div className="flex flex-wrap items-center gap-3 pt-4 lg:hidden">
            {isEnrolled ? (
              <button
                onClick={handleContinueLearning}
                className="flex-1 min-w-[160px] py-3 rounded-2xl bg-green-600 text-white text-xs font-extrabold hover:bg-green-700 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Continue Learning
              </button>
            ) : (
              <>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 min-w-[120px] py-3 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-extrabold hover:opacity-95 cursor-pointer text-center"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleCartClick}
                  className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                    inCart
                      ? "bg-brand-blue/20 border-brand-blue/30 text-white"
                      : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                  }`}
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleWishlistClick}
                  className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                    inWishlist
                      ? "bg-red-500/20 border-red-500/30 text-red-500"
                      : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                  }`}
                >
                  <Heart
                    className={`w-4.5 h-4.5 ${inWishlist ? "fill-red-500" : ""}`}
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* Left Columns - Detailed content */}
        <div className="w-full lg:w-8/12 space-y-10">
          {/* Video Preview Player */}
          {chapters
            .flatMap((c) => c.lessons || [])
            .some((l) => l.isPreview) && (
            <section className="bg-bg-card rounded-[32px] border border-brand-border premium-shadow p-5 relative overflow-hidden">
              {isPlaying && previewLesson ? (
                <div className="h-[280px] sm:h-[400px] w-full rounded-2xl relative">
                  <VideoPlayer
                    lesson={previewLesson}
                    courseId={course._id}
                    onComplete={handlePreviewComplete}
                    onProgress={handlePreviewProgress}
                    isCompleted={false}
                    initialTime={0}
                    posterUrl={course.thumbnailUrl}
                  />
                  <button
                    onClick={handleCloseVideo}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  className="relative h-[280px] sm:h-[400px] w-full rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    const firstPreviewLesson = chapters
                      .flatMap((c) => c.lessons || [])
                      .find((l) => l.isPreview);

                    if (firstPreviewLesson?.videoUrl) {
                      setPreviewLesson(firstPreviewLesson);
                      setIsPlaying(true);
                    }
                  }}
                >
                  {/* Course Image */}
                  <img
                    src={course?.thumbnailUrl}
                    alt={course?.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10 group-hover:bg-black/40 transition-all" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-purple">
                      <Play
                        className="w-9 h-9 text-white fill-white ml-1"
                        strokeWidth={2}
                      />
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                      <Clock className="w-4 h-4 text-brand-purple-light" />
                      <span className="text-sm font-medium text-white">
                        Preview Course
                      </span>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md px-3 py-2 rounded-full text-white text-sm font-medium border border-white/10">
                      Free
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* What You'll Learn Section */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-extrabold text-brand-navy">
                What you'll learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-card border border-brand-border rounded-2xl p-4 flex gap-3 premium-shadow"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-brand-navy leading-relaxed">
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Curriculum Accordion */}
          <section className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xl font-extrabold text-brand-navy">
                Course curriculum
              </h3>
              <span className="text-xs text-brand-gray font-bold">
                {chapters.length} modules • {course.totalLessons} lessons
              </span>
            </div>

            {chapters.length > 0 ? (
              <div className="border border-brand-border rounded-3xl bg-bg-card overflow-hidden premium-shadow divide-y divide-brand-border/60">
                {chapters.map((chapter) => {
                  const isOpen = activeModules.includes(chapter._id);
                  const chapterDuration = chapter.lessons.reduce(
                    (acc, l) => acc + (l.durationSeconds || l.duration || 0),
                    0,
                  );

                  return (
                    <div key={chapter._id} className="transition-all">
                      {/* Chapter Header Toggle */}
                      <button
                        onClick={() => toggleModule(chapter._id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-bg-secondary/40"
                      >
                        <div className="space-y-1 pr-4">
                          <h4 className="text-sm font-extrabold text-brand-navy leading-snug">
                            {chapter.title}
                          </h4>
                          <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">
                            {chapter.lessons.length} lectures •{" "}
                            {formatDuration(chapterDuration)}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-brand-navy transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Lessons Grid under Chapter */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-bg-secondary/20"
                          >
                            <div className="px-6 pb-4 pt-1 divide-y divide-brand-border/40">
                              {chapter.lessons.map((lesson) => (
                                <div
                                  key={lesson._id}
                                  className="py-3 flex items-center justify-between gap-4 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Play className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                                    <span className="font-semibold text-brand-navy truncate">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-brand-gray font-bold">
                                      {formatDuration(
                                        lesson.durationSeconds ||
                                          lesson.duration ||
                                          0,
                                      )}
                                    </span>
                                    {lesson.isPreview && (
                                      <button
                                        onClick={() => handlePlayLesson(lesson)}
                                        className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple rounded-lg text-[9px] font-extrabold hover:bg-brand-purple/20 cursor-pointer flex items-center gap-1"
                                      >
                                        <Play className="w-3 h-3" />
                                        Preview
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-brand-border rounded-3xl bg-bg-card p-8 text-center">
                <p className="text-sm text-brand-gray font-semibold">
                  No curriculum available yet
                </p>
              </div>
            )}
          </section>

          {/* Requirements Section */}
          {course.requirements && course.requirements.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xl font-extrabold text-brand-navy">
                Requirements
              </h3>
              <ul className="space-y-3">
                {course.requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2.5 text-xs text-brand-gray font-semibold leading-relaxed"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple shrink-0 mt-2"></div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Instructor Card */}
          <section className="space-y-4">
            <h3 className="text-xl font-extrabold text-brand-navy">
              Instructor
            </h3>
            <div className="bg-bg-card border border-brand-border rounded-[32px] premium-shadow p-6 flex flex-col sm:flex-row gap-6">
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="w-24 h-24 rounded-full border border-brand-purple/20 bg-bg-secondary object-cover self-center sm:self-start shrink-0"
              />
              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="font-extrabold text-lg text-brand-navy">
                    {instructorName}
                  </h4>
                  <p className="text-xs font-bold text-brand-purple mt-0.5">
                    {instructorRole}
                  </p>
                </div>
                <p className="text-xs font-semibold text-brand-gray leading-relaxed">
                  {instructorBio}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sticky Purchase Sidebar Card (Desktop) */}
        <aside className="w-full lg:w-4/12 hidden lg:block sticky top-24 z-20 self-start h-fit">
          <div className="bg-bg-card rounded-[32px] border border-brand-border premium-shadow p-6 space-y-6">
            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-navy">
                  ₹{displayPrice}
                </span>
                {course.discountPrice && (
                  <span className="text-sm text-brand-gray line-through font-bold">
                    ₹{course.price}
                  </span>
                )}
              </div>
              {course.discountPrice && (
                <p className="text-[10px] text-red-500 font-extrabold">
                  🔥 Limited offer:{" "}
                  {Math.round(
                    ((course.price - course.discountPrice) / course.price) *
                      100,
                  )}
                  % discount included!
                </p>
              )}
            </div>

            {/* Inclusions */}
            <div className="space-y-3.5 border-t border-brand-border/60 pt-5">
              <p className="text-xs font-bold text-brand-navy">
                This course includes:
              </p>
              <ul className="space-y-3 text-xs text-brand-gray font-semibold">
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>{formatDuration(course.duration)} on-demand video</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <InfinityIcon className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Full lifetime access</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Access on mobile and desktop</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-brand-purple shrink-0" />
                  <span>Certificate of completion</span>
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              {isEnrolled ? (
                <button
                  onClick={handleContinueLearning}
                  className="w-full py-3.5 rounded-[20px] bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all premium-shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Continue Learning
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCartClick}
                    className={`w-full py-3.5 rounded-[20px] text-xs font-bold transition-all duration-200 border cursor-pointer ${
                      inCart
                        ? "bg-brand-blue/10 border-brand-blue/20 text-brand-blue"
                        : "bg-bg-card border-brand-purple text-brand-purple hover:bg-brand-purple/5"
                    }`}
                  >
                    {inCart ? "Remove From Cart" : "Add To Cart"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 rounded-[20px] bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold hover:opacity-95 transition-all premium-shadow cursor-pointer"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            {/* Wishlist toggle */}
            {!isEnrolled && (
              <button
                onClick={handleWishlistClick}
                className="w-full py-2.5 border border-brand-border rounded-[20px] text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-brand-gray"}`}
                />
                <span>
                  {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                </span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
