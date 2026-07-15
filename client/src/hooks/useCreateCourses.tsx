import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import type { Lesson } from "../api/lessonApi";
import type { Category } from "../api/categoryApi";
import type {
  Course,
  CreateCourseData,
  UpdateCourseData,
} from "../api/courseApi";
import type { Module } from "../api/moduleApi";
import {
  FileVideo,
  FileText,
  LinkIcon,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import { categoryService } from "../services/categoryService";
import { courseService } from "../services/courseService";
import { moduleService } from "../services/moduleService";
import { lessonService } from "../services/lessonService";
import { uploadLargeFile } from "../utils/multipartUpload";
import { formatDuration, getVideoDuration } from "../utils/Helping";

export type Step = "basic" | "curriculum" | "pricing" | "publish";

// Form data type for course creation/editing (separate from API Course type)
export interface CourseFormData {
  _id?: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  shortDescription?: string;
  category: string;
  tags?: string[];
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  price: number;
  discountPrice?: number;
  currency?: string;
  isPublished?: boolean;
  requirements?: string[];
  learningOutcomes?: string[];
  targetAudience?: string[];
}

const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
] as const;
const CURRENCIES = ["USD", "EUR", "GBP"] as const;

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

const steps: { id: Step; label: string }[] = [
  { id: "basic", label: "Basic Info" },
  { id: "curriculum", label: "Curriculum" },
  { id: "pricing", label: "Pricing" },
  { id: "publish", label: "Publish" },
];

const lessonTypes = [
  {
    type: "video",
    label: "Video",
    icon: <FileVideo size={18} />,
    color: "bg-red-100 text-red-700",
  },
  {
    type: "pdf",
    label: "PDF",
    icon: <FileText size={18} />,
    color: "bg-blue-100 text-blue-700",
  },
  {
    type: "article",
    label: "Article",
    icon: <FileText size={18} />,
    color: "bg-green-100 text-green-700",
  },
  {
    type: "link",
    label: "External Link",
    icon: <LinkIcon size={18} />,
    color: "bg-purple-100 text-purple-700",
  },
  {
    type: "quiz",
    label: "Quiz",
    icon: <HelpCircle size={18} />,
    color: "bg-orange-100 text-orange-700",
  },
  {
    type: "assignment",
    label: "Assignment",
    icon: <ClipboardList size={18} />,
    color: "bg-pink-100 text-pink-700",
  },
];



export default function useCreateCourses() {
  const navigate = useNavigate();
  const { id: pathId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const courseId = pathId || searchParams.get("edit");
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseCreated, setCourseCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Course state - using CourseFormData for form state
  const [course, setCourse] = useState<CourseFormData>({
    _id: courseId || undefined,
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    shortDescription: "",
    category: "",
    tags: [],
    level: "beginner",
    language: "English",
    thumbnailUrl: "",
    thumbnailKey: "",
    price: 0,
    discountPrice: undefined,
    currency: "INR",
    isPublished: false,
    requirements: [],
    learningOutcomes: [],
    targetAudience: [],
  });

  // Curriculum state
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonPanelOpen, setLessonPanelOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  // Upload state
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lessonVideoUploading, setLessonVideoUploading] = useState(false);
  const [lessonVideoProgress, setLessonVideoProgress] = useState(0);
  const videoUploadAbortControllerRef = useRef<AbortController | null>(null);

  const [lessonVideoLocalUrl, setLessonVideoLocalUrl] = useState<string | null>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (lessonVideoLocalUrl) URL.revokeObjectURL(lessonVideoLocalUrl);
    };
  }, [lessonVideoLocalUrl]);

  // Reset local lesson video URL when selected lesson changes
  useEffect(() => {
    setLessonVideoLocalUrl(null);
  }, [selectedLesson?._id]);

  const cancelVideoUpload = useCallback(() => {
    if (videoUploadAbortControllerRef.current) {
      videoUploadAbortControllerRef.current.abort();
      videoUploadAbortControllerRef.current = null;
    }
    setUploadingVideo(false);
    setLessonVideoUploading(false);
    setLessonVideoLocalUrl(null);
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load existing course if editing
  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories();
      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const loadCourse = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const courseData = await courseService.getCourseById(courseId);
      if (courseData) {
        const formData: CourseFormData = {
          _id: courseData._id,
          title: courseData.title,
          slug: courseData.slug,
          subtitle: courseData.subtitle || "",
          description: courseData.description,
          shortDescription: courseData.shortDescription || "",
          category:
            typeof courseData.category === "string"
              ? courseData.category
              : courseData.category?._id || "",
          tags: courseData.tags || [],
          level: courseData.level as "beginner" | "intermediate" | "advanced",
          language: courseData.language,
          thumbnailUrl: courseData.thumbnailUrl || "",
          thumbnailKey: courseData.thumbnailKey || "",
          price: courseData.price || 0,
          discountPrice: courseData.discountPrice,
          currency: courseData.currency || "INR",
          isPublished: courseData.isPublished || false,
          requirements: courseData.requirements || [],
          learningOutcomes: courseData.learningOutcomes || [],
          targetAudience: courseData.targetAudience || [],
        };
        setCourse(formData);
        setCourseCreated(true);
        await loadModules(courseId);
      }
    } catch (err) {
      console.error("Error loading course:", err);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (crsId: string) => {
    try {
      const modulesData = await moduleService.getModulesByCourse(crsId);
      if (modulesData) {
        // Fetch lessons for each module
        const modulesWithLessons: Module[] = await Promise.all(
          modulesData.map(async (moduleData: Module) => {
            try {
              const lessonsData = await lessonService.getLessonsByModule(
                moduleData._id,
              );
              return {
                ...moduleData,
                lessons: lessonsData || [],
              };
            } catch (err) {
              console.error(
                `Error loading lessons for module ${moduleData._id}:`,
                err,
              );
              return {
                ...moduleData,
                lessons: [],
              };
            }
          }),
        );

        setModules(modulesWithLessons);
        setExpandedModules(new Set(modulesData.map((m) => m._id)));
      } else {
        setModules([]);
      }
    } catch (err) {
      console.error("Error loading modules:", err);
      setModules([]);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (course.title && !courseId) {
      const slug = course.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setCourse((prev) => ({ ...prev, slug }));
    }
  }, [course.title, courseId]);

  // Calculate totals
  const totalModules = modules.length;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalDuration = modules.reduce(
    (sum, m) =>
      sum + m.lessons.reduce((s, l) => s + (l.durationSeconds || 0), 0),
    0,
  );

  // Create course in database
  const createCourseInDB = useCallback(async (): Promise<string | null> => {
    if (courseId) return courseId;

    try {
      const createData: CreateCourseData = {
        title: course.title || "Untitled Course",
        slug: course.slug || generateSlug(course.title || "untitled-course"),
        subtitle: course.subtitle,
        description: course.description || "",
        shortDescription: course.shortDescription,
        thumbnailUrl: course.thumbnailUrl || "",
        thumbnailKey: course.thumbnailKey || "",
        price: course.price,
        level: course.level,
        language: course.language,
        category: course.category,
        duration: totalDuration,
        requirements: course.requirements,
        learningOutcomes: course.learningOutcomes,
        targetAudience: course.targetAudience,
      };

      const response = await courseService.createCourse(createData);

      if (response) {
        setCourse((prev) => ({
          ...prev,
          _id: response._id,
        }));
        setCourseCreated(true);
        navigate(`/instructor/course/${response._id}/manage`, {
          replace: true,
        });
        return response._id;
      }
      return null;
    } catch (err) {
      console.error("Error creating course:", err);
      setError("Failed to create course");
      return null;
    }
  }, [course, courseId, navigate, totalDuration]);

  const saveCourse = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      let crsId = courseId;

      if (!crsId) {
        crsId = await createCourseInDB();
        if (!crsId) {
          setSaving(false);
          return;
        }
      } else {
        const updateData: UpdateCourseData = {
          title: course.title,
          slug: course.slug || undefined,
          subtitle: course.subtitle || undefined,
          description: course.description,
          shortDescription: course.shortDescription,
          thumbnailUrl: course.thumbnailUrl || undefined,
          thumbnailKey: course.thumbnailKey || undefined,
          price: course.price,
          discountPrice: course.discountPrice,
          level: course.level,
          language: course.language,
          category: course.category,
          duration: totalDuration,
          requirements: course.requirements,
          learningOutcomes: course.learningOutcomes,
          targetAudience: course.targetAudience,
        };

        const response = await courseService.updateCourse(crsId, updateData);

        if (!response) {
          throw new Error("Failed to update course");
        }
      }
    } catch (err: any) {
      console.error("Error saving course:", err);
      setError(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  }, [course, courseId, createCourseInDB, totalDuration]);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    setError(null);
    try {
      // Get presigned URL from backend
      const presignedData = await courseService.getUploadPresignedUrl({
        type: "thumbnail",
        fileName: file.name,
        fileType: file.type,
      });

      // Upload file directly to R2 using presigned URL
      await fetch(presignedData.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Use the public URL returned from the backend
      const thumbnailUrl = presignedData.publicUrl;

      setCourse((prev) => ({
        ...prev,
        thumbnailUrl: thumbnailUrl,
        thumbnailKey: presignedData.key,
      }));
      setUploadingThumbnail(false);
    } catch (err) {
      console.error("Error uploading thumbnail:", err);
      setError("Failed to upload thumbnail");
      setUploadingThumbnail(false);
    }
  };



  // Module CRUD
  const addModule = async () => {
    let crsId = courseId;
    if (!crsId) {
      crsId = await createCourseInDB();
      if (!crsId) return;
    }
    const nextOrder =
      modules.length > 0
        ? Math.max(...modules.map((module) => module.order)) + 1
        : 1;
    try {
      const response = await moduleService.createModule({
        course: crsId,
        title: "New Module",
        order: nextOrder,
        duration: 1,
      });

      if (response) {
        const newModule: Module = {
          _id: response._id,
          title: response.title,
          description: response.description,
          order: response.order,
          duration: response.duration,
          lessons: [],
        };
        setModules([...modules, newModule]);
        setExpandedModules(new Set([...expandedModules, response._id]));
        setEditingModuleId(response._id);
        setEditingModuleTitle("New Module");
      }
    } catch (err) {
      console.error("Error adding module:", err);
      setError("Failed to add module");
    }
  };

  const updateModuleTitle = async (moduleId: string, title: string) => {
    if (!title.trim()) return;

    setModules(
      modules.map((module) =>
        module._id === moduleId ? { ...module, title } : module,
      ),
    );

    try {
      await moduleService.updateModule(moduleId, { title });
      setEditingModuleId(null);
    } catch (err) {
      console.error("Error updating module title:", err);
      setError("Failed to update module title");
    }
  };

  const deleteModule = async (moduleId: string) => {
    setModules(modules.filter((module) => module._id !== moduleId));

    try {
      await moduleService.deleteModule(moduleId);

      if (selectedLesson) {
        setSelectedLesson(null);
        setLessonPanelOpen(false);
      }
    } catch (err) {
      console.error("Error deleting module:", err);
      setError("Failed to delete module");
    }
  };

  // Lesson CRUD
  const addLesson = async (moduleId: string) => {
    const moduleData = modules.find((module) => module._id === moduleId);
    if (!moduleData) return;

    const crsId = course._id;
    if (!crsId) {
      setError("Course must be created before adding lessons");
      return;
    }

    try {
      const lessonData = await lessonService.createLesson({
        module: moduleId,
        course: crsId,
        title: "New Lesson",
        order: moduleData.lessons.length,
        duration: 0,
        contentType: "video",
        isPublished: false,
        isFree: false,
        isPreview: false,
      });

      if (lessonData) {
        // Update modules state with the new lesson
        setModules((prevModules) =>
          prevModules.map((module) =>
            module._id === moduleId
              ? { ...module, lessons: [...module.lessons, lessonData] }
              : module,
          ),
        );
        setSelectedLesson(lessonData);
        setLessonPanelOpen(true);
      }
    } catch (err) {
      console.error("Error adding lesson:", err);
      setError("Failed to add lesson");
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    setModules(
      modules.map((module) =>
        module._id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter((l) => l._id !== lessonId),
            }
          : module,
      ),
    );

    try {
      await lessonService.deleteLesson(lessonId);
      setSelectedLesson(null);
      setLessonPanelOpen(false);
    } catch (err) {
      console.error("Error deleting lesson:", err);
      setError("Failed to delete lesson");
    }
  };

  const updateLesson = async (lesson: Lesson, saveToDB = true) => {
    setModules(
      modules.map((module) =>
        module._id === lesson.module ||
        module.lessons.some((l) => l._id === lesson._id)
          ? {
              ...module,
              lessons: module.lessons.map((l) =>
                l._id === lesson._id ? lesson : l,
              ),
            }
          : module,
      ),
    );
    setSelectedLesson(lesson);

    if (saveToDB) {
      try {
        await lessonService.updateLesson(lesson._id, {
          title: lesson.title,
          description: lesson.description,
          duration: lesson.durationSeconds,
          durationSeconds: lesson.durationSeconds,
          videoUrl: lesson.videoUrl,
          contentType: lesson.contentType || lesson.lesson_type || "video",
          isPreview: lesson.isPreview || lesson.is_free_preview || false,
          isFree: lesson.isFree || lesson.is_free_preview || false,
          isPublished: lesson.isPublished || false,
          textContent: lesson.textContent || lesson.content_text || undefined,
          markdownContent:
            lesson.markdownContent || lesson.content_text || undefined,
          order: lesson.order,
        });
      } catch (err) {
        console.error("Error updating lesson:", err);
        setError("Failed to update lesson");
      }
    }
  };

  const handleLessonVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLesson) return;

    if (lessonVideoLocalUrl) URL.revokeObjectURL(lessonVideoLocalUrl);
    const localUrl = URL.createObjectURL(file);
    setLessonVideoLocalUrl(localUrl);

    setLessonVideoUploading(true);
    setLessonVideoProgress(0);
    setError(null);

    let duration = 0;
    try {
      duration = await getVideoDuration(file);
      const durationSecs = Math.round(duration);
      // Update duration immediately so it displays in the UI right away
      setSelectedLesson((prev) => prev ? { ...prev, durationSeconds: durationSecs } : null);
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.lessons.some((l) => l._id === selectedLesson._id)) {
            return {
              ...module,
              lessons: module.lessons.map((l) =>
                l._id === selectedLesson._id ? { ...l, durationSeconds: durationSecs } : l
              ),
            };
          }
          return module;
        })
      );
    } catch (durationErr) {
      console.warn("Could not extract video duration immediately:", durationErr);
    }

    try {
      // Instantiate new controller for this upload session
      const controller = new AbortController();
      videoUploadAbortControllerRef.current = controller;

      const result = await uploadLargeFile({
        file,
        uploadType: "lecture",
        associatedId: selectedLesson._id,
        onProgress: (p) => setLessonVideoProgress(p),
        signal: controller.signal,
      });

      const streamUrl = `/api/v1/lessons/${selectedLesson._id}/stream`;

      // Update lesson in DB and state with finished parameters (ready status)
      await updateLesson({
        ...selectedLesson,
        videoUrl: streamUrl,
        videoKey: result.key,
        videoStatus: "ready",
        durationSeconds: duration ? Math.round(duration) : (selectedLesson.durationSeconds || 0),
      });

      setLessonVideoUploading(false);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Lesson video upload cancelled successfully");
        setError("Upload cancelled");
      } else {
        console.error("Error uploading lesson video:", err);
        setError("Failed to upload video");
      }
      setLessonVideoUploading(false);
    }
  };

  const handleLessonPdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLesson) return;

    setError(null);
    try {
      // In production, upload to storage service and get URL
      const fileUrl = URL.createObjectURL(file);
      await updateLesson({
        ...selectedLesson,
        videoUrl: fileUrl,
      });
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setError("Failed to upload PDF");
    }
  };

  // Validation for publish step
  const validation = {
    thumbnailUrl: !!course.thumbnailUrl,
    curriculum: totalLessons > 0,
    pricing: (course.price || 0) > 0,
    description: !!course.description,
  };

  const canPublish = Object.values(validation).every(Boolean);
  const canProceedToCurriculum = !!course.title && !!course.description;

  const handlePublish = async () => {
    if (!canPublish) return;

    setSaving(true);
    setError(null);
    try {
      let crsId = courseId;
      if (!crsId) {
        crsId = await createCourseInDB();
      }

      if (crsId) {
        const response = await courseService.updateCourse(crsId, {
          status: "published",
          isPublished: true,
          totalModules,
          totalLessons,
          duration: totalDuration,
        });

        if (response) {
          navigate("/instructor/courses");
        } else {
          throw new Error("Failed to publish course");
        }
      }
    } catch (err: any) {
      console.error("Error publishing:", err);
      setError(err.message || "Failed to publish course");
    } finally {
      setSaving(false);
    }
  };

  const goToNextStep = async () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    // If moving from basic to curriculum, create the course first
    if (currentStep === "basic" && !courseId && !courseCreated) {
      const newCourseId = await createCourseInDB();
      if (!newCourseId) return; // Failed to create
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  return {
    // State
    currentStep,
    saving,
    loading,
    courseCreated,
    error,
    course,
    modules,
    expandedModules,
    selectedLesson,
    lessonPanelOpen,
    editingModuleId,
    editingModuleTitle,
    uploadingThumbnail,
    lessonVideoUploading,
    lessonVideoProgress,
    lessonVideoLocalUrl,
    categories,
    totalModules,
    totalLessons,
    totalDuration,
    validation,
    canPublish,
    canProceedToCurriculum,
    steps,
    lessonTypes,
    COURSE_LEVELS,
    LANGUAGES,
    CURRENCIES,

    // Actions
    setCurrentStep,
    setCourse,
    setExpandedModules,
    setSelectedLesson,
    setLessonPanelOpen,
    setEditingModuleId,
    setEditingModuleTitle,
    saveCourse,
    handleThumbnailUpload,
    addModule,
    updateModuleTitle,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    handleLessonVideoUpload,
    cancelVideoUpload,
    handleLessonPdfUpload,
    handlePublish,
    goToNextStep,
    goToPrevStep,
    formatDuration,
    loadCourse,
  };
}
