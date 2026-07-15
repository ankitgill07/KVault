import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  Card,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import {
  AlignLeft,
  BarChart,
  BookOpen,
  Check,
  Copy,
  DollarSign,
  Folder,
  Globe,
  Heading,
  ImageIcon,
  Link,
  Plus,
  Tag,
  Upload,
  Video,
  X,
  Save,
} from "lucide-react";
import type { CourseFormData } from "../../../hooks/useCreateCourses";
import type { Category } from "../../../api/categoryApi";
import { getMediaUrl } from "../../../utils/mediaUrl";

interface BasicInfoProps {
  course: CourseFormData;
  setCourse: React.Dispatch<React.SetStateAction<CourseFormData>>;
  categories: Category[];
  loading: boolean;
  onSave: () => Promise<void>;
  saving: boolean;
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingThumbnail: boolean;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

function BasicInfo({
  course,
  setCourse,
  categories,
  loading,
  onSave,
  saving,
  onThumbnailUpload,
  uploadingThumbnail,
}: BasicInfoProps) {
  const [tagInput, setTagInput] = useState("");

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !(course.tags || []).includes(trimmed)) {
      setCourse({
        ...course,
        tags: [...(course.tags || []), trimmed],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCourse({
      ...course,
      tags: (course.tags || []).filter((t) => t !== tagToRemove),
    });
  };
  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setCourse((prev) => {
        // Auto-generate slug if not manually edited
        const newSlug = isSlugManuallyEdited
          ? prev.slug
          : generateSlug(newTitle);
        return { ...prev, title: newTitle, slug: newSlug };
      });
    },
    [isSlugManuallyEdited],
  );

  const handleSlugChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setCourse((prev) => ({ ...prev, slug: e.target.value }));
  }, []);

  // Reset slug auto-generation when title is cleared
  const handleTitleBlur = useCallback(() => {
    if (!course.title) {
      setIsSlugManuallyEdited(false);
    }
  }, [course.title]);



  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // --- File Upload Handlers ---
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      // Call the parent handler to update course state
      onThumbnailUpload(e);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {course._id ? 'Edit Course' : 'Create Course'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Fill in the details below to set up your new syllabus and media
            assets.
          </p>
        </div>
        <Button
          onClick={onSave}
          disabled={saving || loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : course._id ? 'Update Course' : 'Save Course'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80">
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Basic details about your course</CardDescription>
            </div>

            <div className="p-6 space-y-5">
              {/* Course Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Course Title
                </label>
                <input
                  type="text"
                  value={course.title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  placeholder="e.g. Complete React Developer Course"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm"/>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <Link className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Course Slug
                </label>
                <input
                  type="text"
                  value={course.slug}
                  onChange={handleSlugChange}
                  placeholder="course-url-slug"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm"
                />
              </div>
              {/* Subtitle */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <Heading className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Subtitle
                </label>
                <input
                  type="text"
                  value={course.subtitle}
                  onChange={(e) =>
                    setCourse({ ...course, subtitle: e.target.value })
                  }
                  placeholder="e.g. Master React from basics to advanced patterns"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <AlignLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Description
                </label>
                <textarea
                  rows={5}
                  value={course.description}
                  onChange={(e) =>
                    setCourse({ ...course, description: e.target.value })
                  }
                  placeholder="Describe what students will learn in this course..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm resize-none"
                />
              </div>

              {/* Category & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={course.category}
                      onChange={(e) =>
                        setCourse({ ...course, category: e.target.value })
                      }
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm cursor-pointer pr-10"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                      ▼
                    </span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <BarChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Level
                  </label>
                  <div className="relative">
                    <select
                      value={course.level}
                      onChange={(e) =>
                        setCourse({ ...course, level: e.target.value as any })
                      }
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm cursor-pointer pr-10"
                    >
                      <option value="">Select level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Language & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Language
                  </label>
                  <div className="relative">
                    <select
                      value={course.language}
                      onChange={(e) =>
                        setCourse({ ...course, language: e.target.value })
                      }
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm shadow-sm cursor-pointer pr-10"
                    >
                      <option value="">Select language</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                      ▼
                    </span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      value="INR"
                      disabled
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none cursor-not-allowed text-sm shadow-sm pr-10 opacity-80"
                    >
                      <option value="INR">INR (₹)</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Tags
                </label>
                   <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all">
                  {(course.tags || []).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        type="button"
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/50 p-0.5 rounded-full transition-colors"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center flex-1 min-w-[120px]">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add tag..."
                      className="w-full bg-transparent text-sm outline-none border-none py-1 px-1 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
                    />
                    {tagInput.trim() && (
                      <button
                        type="button"
                        onClick={addTag}
                        className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Media Attachments Side Grid */}
        <div className="space-y-6">
          {/* Thumbnail Upload */}
          <Card>
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80">
              <CardTitle>Course Thumbnail</CardTitle>
              <CardDescription>Upload a thumbnail image</CardDescription>
            </div>
            <div className="p-6">
              <input
                type="file"
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
                accept="image/png, image/jpeg"
                className="hidden"
              />
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-pointer group bg-zinc-50/50 dark:bg-zinc-900/30"
              >
                {thumbnail || course.thumbnailUrl ? (
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner max-h-40 bg-black flex items-center justify-center">
                      <img
                        src={thumbnail ? URL.createObjectURL(thumbnail) : getMediaUrl(course.thumbnailUrl)}
                        alt="Course Thumbnail"
                        className="w-full max-h-40 object-cover"
                      />
                    </div>
                    <p className="text-xs text-zinc-400">
                      {thumbnail ? `${thumbnail.name} (${(thumbnail.size / (1024 * 1024)).toFixed(2)} MB)` : "Existing course thumbnail"} • Click to replace
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-200">
                      <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Click to upload
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>


        </div>
      </div>
    </div>
  );
}

export default BasicInfo;
