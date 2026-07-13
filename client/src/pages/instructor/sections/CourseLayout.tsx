import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FileText,
  DollarSign,
  Eye,
  Save,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import BasicInfo from "../sections/BasicInfo";
import { Details } from "../sections/Details";
import { Curriculum } from "../sections/Curriculum";
import { Pricing } from "../sections/Pricing";
import useCreateCourses from "../../../hooks/useCreateCourses";

type CourseTab = "basic" | "details" | "curriculum" | "pricing";

const formTabs = [
  {
    id: "basic",
    label: "Course Landing",
    icon: BookOpen,
    desc: "Basics & media assets",
  },
  {
    id: "details",
    label: "Course Details",
    icon: FileText,
    desc: "Objectives & targeted devs",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    icon: ClipboardList,
    desc: "Syllabus builder",
  },
  {
    id: "pricing",
    label: "Pricing Model",
    icon: DollarSign,
    desc: "Price & coupon billing",
  },
] as const;

export default function CourseLayout() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<CourseTab>("basic");

  const {
    categories,
    course,
    loading,
    saving,
    setCourse,
    saveCourse,
    handleThumbnailUpload,
    uploadingThumbnail,
    cancelVideoUpload,
    lessonVideoLocalUrl,
    modules,
    addModule,
    updateModuleTitle,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    selectedLesson,
    setSelectedLesson,
    lessonPanelOpen,
    setLessonPanelOpen,
    editingModuleId,
    setEditingModuleId,
    editingModuleTitle,
    setEditingModuleTitle,
    handleLessonVideoUpload,
    handleLessonPdfUpload,
    lessonVideoUploading,
    lessonVideoProgress,
    handlePublish,
    formatDuration,
    canPublish,
    validation,
  } = useCreateCourses();

  // Redirect back if course doesn't exist
  useEffect(() => {
    // If we're loading or saving, ignore. If it's a new course without edit ID, route back.
    if (!id && !loading && !saving) {
      navigate("/instructor/courses");
    }
  }, [id, loading, saving, navigate]);

  if (loading && !course.title) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Loading course manager...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/instructor/courses")}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm bg-violet-600 text-white w-6 h-6 rounded-md flex items-center justify-center">
              K
            </span>
            <h1 className="font-bold text-sm tracking-tight hidden sm:block">
              KVault Course Manager
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge
            variant={course.isPublished ? "success" : "neutral"}
            className="rounded-lg py-1 px-2.5 text-xs font-semibold"
          >
            {course.isPublished ? "Published" : "Draft"}
          </Badge>

          <Button
            variant="outline"
            onClick={() => window.open(`/course/${course.slug}`, "_blank")}
            className="flex items-center gap-2 text-xs font-semibold h-9 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>

          <Button
            onClick={handlePublish}
            disabled={saving || (activeTab === "basic" && !course.title)}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold h-9 rounded-xl shadow-sm shadow-violet-500/10"
          >
            {course.isPublished ? "Unpublish Course" : "Publish Course"}
          </Button>
        </div>
      </header>

      {/* Main layout container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Course Settings Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-1.5 shadow-sm">
              <div className="px-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-3">
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                  Setup Course
                </p>
                <h3 className="font-bold text-zinc-900 dark:text-white truncate mt-1 text-sm">
                  {course.title || "Untitled Course"}
                </h3>
              </div>

              {formTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as CourseTab)}
                    className={`w-full flex items-start gap-3.5 px-3 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-zinc-400"}`}
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold leading-none">
                        {tab.label}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-none font-medium truncate">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Validation checklist card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Release Checklist
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Thumbnail Uploaded</span>
                  <Badge
                    variant={validation.thumbnailUrl ? "success" : "neutral"}
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  >
                    {validation.thumbnailUrl ? "Done" : "Required"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Curriculum Syllabus</span>
                  <Badge
                    variant={validation.curriculum ? "success" : "neutral"}
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  >
                    {validation.curriculum ? "Done" : "Required"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Course Pricing</span>
                  <Badge
                    variant={validation.pricing ? "success" : "neutral"}
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  >
                    {validation.pricing ? "Done" : "Required"}
                  </Badge>
                </div>
              </div>
            </div>
          </aside>

          {/* Right main workspace columns */}
          <main className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            {activeTab === "basic" && (
              <BasicInfo
                course={course}
                setCourse={setCourse}
                categories={categories}
                loading={loading}
                onSave={saveCourse}
                saving={saving}
                onThumbnailUpload={handleThumbnailUpload}
                uploadingThumbnail={uploadingThumbnail}
              />
            )}

            {activeTab === "details" && (
              <Details
                course={course}
                setCourse={setCourse}
                saving={saving}
                onSave={saveCourse}
              />
            )}

            {activeTab === "curriculum" && (
              <Curriculum
                modules={modules}
                addModule={addModule}
                updateModuleTitle={updateModuleTitle}
                deleteModule={deleteModule}
                addLesson={addLesson}
                updateLesson={updateLesson}
                deleteLesson={deleteLesson}
                selectedLesson={selectedLesson}
                setSelectedLesson={setSelectedLesson}
                lessonPanelOpen={lessonPanelOpen}
                setLessonPanelOpen={setLessonPanelOpen}
                editingModuleId={editingModuleId}
                setEditingModuleId={setEditingModuleId}
                editingModuleTitle={editingModuleTitle}
                setEditingModuleTitle={setEditingModuleTitle}
                handleLessonVideoUpload={handleLessonVideoUpload}
                handleLessonPdfUpload={handleLessonPdfUpload}
                lessonVideoUploading={lessonVideoUploading}
                lessonVideoProgress={lessonVideoProgress}
                cancelVideoUpload={cancelVideoUpload}
                formatDuration={formatDuration}
                lessonVideoLocalUrl={lessonVideoLocalUrl}
              />
            )}

            {activeTab === "pricing" && (
              <Pricing
                course={course}
                setCourse={setCourse}
                saving={saving}
                onSave={saveCourse}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
