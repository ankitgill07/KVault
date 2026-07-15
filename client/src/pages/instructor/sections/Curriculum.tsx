import { useState, useRef, useEffect } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { 
  Plus, Trash2, Edit2, ChevronDown, ChevronUp, GripVertical, 
  Video, Eye, FileText, Upload, PlusCircle, Check, Play, Loader2, Link2, HelpCircle, ClipboardList, X, ExternalLink
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardTitle, CardDescription } from "../../../components/ui/card";
import type { Module } from "../../../api/moduleApi";
import type { Lesson } from "../../../api/lessonApi";
import { getMediaUrl } from "../../../utils/mediaUrl";
import { lessonService } from "../../../services/lessonService";
import { courseService } from "../../../services/courseService";
import { Badge } from "../../../components/ui/badge";

interface Props {
  modules: Module[];
  addModule: () => Promise<void>;
  updateModuleTitle: (id: string, title: string) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
  addLesson: (moduleId: string) => Promise<void>;
  updateLesson: (lesson: Lesson, save?: boolean) => Promise<void>;
  deleteLesson: (moduleId: string, id: string) => Promise<void>;
  selectedLesson: Lesson | null;
  setSelectedLesson: (l: Lesson | null) => void;
  lessonPanelOpen: boolean;
  setLessonPanelOpen: (open: boolean) => void;
  editingModuleId: string | null;
  setEditingModuleId: (id: string | null) => void;
  editingModuleTitle: string;
  setEditingModuleTitle: (title: string) => void;
  handleLessonVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLessonPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  lessonVideoUploading: boolean;
  lessonVideoProgress: number;
  cancelVideoUpload?: () => void;
  formatDuration?: (durationSeconds: number) => string;
  lessonVideoLocalUrl?: string | null;
}

const lessonTypes = [
  { type: "video", label: "Video", icon: Video },
  { type: "pdf", label: "PDF", icon: FileText },
  { type: "quiz", label: "Quiz", icon: HelpCircle },
  { type: "assignment", label: "Assignment", icon: ClipboardList },
];

export function Curriculum({
  modules = [],
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
  cancelVideoUpload,
  formatDuration = (durationSeconds: number) => `${durationSeconds}s`,
  lessonVideoLocalUrl,
}: Props) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const resourceFileInputRef = useRef<HTMLInputElement>(null);
  const getFormattedDuration = (durationSeconds?: number) =>
    typeof durationSeconds === "number" ? formatDuration(durationSeconds) : "0s";

  const [resources, setResources] = useState<any[]>([]);
  const [fetchingResources, setFetchingResources] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [resourceLinkTitle, setResourceLinkTitle] = useState("");
  const [resourceLinkUrl, setResourceLinkUrl] = useState("");
  const [resourceIdToDelete, setResourceIdToDelete] = useState<string | null>(null);
  const [moduleIdToDelete, setModuleIdToDelete] = useState<string | null>(null);
  const [lessonIdToDelete, setLessonIdToDelete] = useState<{ moduleId: string; lessonId: string } | null>(null);

  const handleConfirmDeleteModule = async () => {
    if (!moduleIdToDelete) return;
    try {
      await deleteModule(moduleIdToDelete);
    } catch (err) {
      console.error("Error deleting module:", err);
    } finally {
      setModuleIdToDelete(null);
    }
  };

  const handleConfirmDeleteLesson = async () => {
    if (!lessonIdToDelete) return;
    try {
      await deleteLesson(lessonIdToDelete.moduleId, lessonIdToDelete.lessonId);
    } catch (err) {
      console.error("Error deleting lesson:", err);
    } finally {
      setLessonIdToDelete(null);
    }
  };

  useEffect(() => {
    if (selectedLesson?._id) {
      loadResources(selectedLesson._id);
    } else {
      setResources([]);
    }
  }, [selectedLesson?._id]);

  const loadResources = async (lessonId: string) => {
    try {
      setFetchingResources(true);
      const resData = await lessonService.getLessonResources(lessonId);
      setResources(resData || []);
    } catch (err) {
      console.error("Error loading resources:", err);
    } finally {
      setFetchingResources(false);
    }
  };

  const handleResourceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLesson) return;

    if (file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".mkv") || file.name.endsWith(".mov")) {
      alert("Video files are not allowed as lecture resources.");
      return;
    }

    setUploadingResource(true);
    try {
      const presignedData = await courseService.getUploadPresignedUrl({
        type: "resource",
        fileName: file.name,
        fileType: file.type,
      });

      await fetch(presignedData.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      const resourceUrl = presignedData.publicUrl;
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      let resourceType = 'document';
      if (extension === 'pdf') resourceType = 'pdf';
      else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) resourceType = 'image';

      await lessonService.addLessonResource(selectedLesson._id, {
        title: file.name,
        type: resourceType,
        url: resourceUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      loadResources(selectedLesson._id);
    } catch (err) {
      console.error("Error uploading resource:", err);
      alert("Failed to upload resource file");
    } finally {
      setUploadingResource(false);
      if (resourceFileInputRef.current) resourceFileInputRef.current.value = "";
    }
  };

  const handleAddLinkResource = async () => {
    if (!selectedLesson || !resourceLinkTitle.trim() || !resourceLinkUrl.trim()) return;

    try {
      await lessonService.addLessonResource(selectedLesson._id, {
        title: resourceLinkTitle.trim(),
        type: "link",
        url: resourceLinkUrl.trim(),
      });
      setResourceLinkTitle("");
      setResourceLinkUrl("");
      setShowAddLink(false);
      loadResources(selectedLesson._id);
    } catch (err) {
      console.error("Error adding link resource:", err);
      alert("Failed to add link resource");
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    setResourceIdToDelete(resourceId);
  };

  const handleConfirmDeleteResource = async () => {
    if (!selectedLesson || !resourceIdToDelete) return;
    try {
      await lessonService.deleteLessonResource(selectedLesson._id, resourceIdToDelete);
      loadResources(selectedLesson._id);
    } catch (err) {
      console.error("Error deleting resource:", err);
      alert("Failed to delete resource");
    } finally {
      setResourceIdToDelete(null);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonPanelOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Course Builder</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Organize your course into structured sections (modules) and video/text lessons.
          </p>
        </div>
        <Button onClick={addModule} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
          <Plus className="w-4 h-4" /> Add Section
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Modules List (Left columns) */}
        <div className="lg:col-span-2 space-y-4">
          {modules.length === 0 ? (
            <Card className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">No sections created yet. Create a section to start building your course.</p>
              <Button onClick={addModule} variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800">
                Create First Section
              </Button>
            </Card>
          ) : (
            modules.map((module, index) => {
              const isExpanded = expandedModules[module._id] !== false; // Default expanded
              const isEditing = editingModuleId === module._id;

              return (
                <Card key={module._id} className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden">
                  {/* Module Header */}
                  <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleModule(module._id)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingModuleTitle}
                            onChange={(e) => setEditingModuleTitle(e.target.value)}
                            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-sm outline-none focus:border-violet-500"
                            autoFocus
                          />
                          <button
                            onClick={() => updateModuleTitle(module._id, editingModuleTitle)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingModuleId(null)}
                            className="p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 truncate">
                          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate">
                            {module.title}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingModuleId(module._id);
                              setEditingModuleTitle(module.title);
                            }}
                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addLesson(module._id)}
                        className="text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 rounded-lg h-8"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Lesson
                      </Button>
                      <button
                        onClick={() => setModuleIdToDelete(module._id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Module Lessons */}
                  {isExpanded && (
                    <div className="p-4 space-y-2.5">
                      {(module.lessons || []).length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-4">No lessons in this section. Add a lesson to begin.</p>
                      ) : (
                        (module.lessons || []).map((lesson, lIdx) => {
                          const isSelected = selectedLesson?._id === lesson._id;
                          return (
                            <div
                              key={lesson._id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-violet-200 dark:border-violet-800/80 bg-violet-50/30 dark:bg-violet-950/10"
                                  : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50/20 dark:bg-zinc-900/5"
                              }`}
                            >
                              <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-700 flex-shrink-0" />
                              <span className="text-[11px] font-mono text-zinc-400 w-5 flex-shrink-0">
                                {lIdx + 1}.
                              </span>
                              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center flex-shrink-0">
                                <Video className="w-4 h-4 text-violet-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                  {lesson.title}
                                </p>
                                {lesson.durationSeconds !== undefined && (
                                  <p className="text-[11px] text-zinc-400 mt-0.5">
                                    {getFormattedDuration(lesson.durationSeconds)}
                                  </p>
                                )}
                              </div>
                              <Badge  className="rounded-lg text-[10px]">
                                {lesson.isPublished ? "Published" : "Draft"}
                              </Badge>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLessonIdToDelete({ moduleId: module._id, lessonId: lesson._id });
                                }}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Lesson Editor Sidebar (Right 1 column) */}
        <div className="lg:col-span-1">
          {lessonPanelOpen && selectedLesson ? (
            <Card className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg rounded-xl p-5 space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Edit Lesson</h3>
                <button
                  onClick={() => setLessonPanelOpen(false)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Lesson Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Title</label>
                <input
                  type="text"
                  value={selectedLesson.title}
                  onChange={(e) => updateLesson({ ...selectedLesson, title: e.target.value }, false)}
                  onBlur={() => updateLesson(selectedLesson)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* Lesson Video URL Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Video Content</label>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleLessonVideoUpload}
                  accept="video/mp4"
                  className="hidden"
                />
                
                {selectedLesson.videoUrl ? (
                  <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-2">
                    <div className="w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner bg-black">
                      <video
                        src={getMediaUrl(selectedLesson.videoUrl)}
                        controls
                        crossOrigin="use-credentials"
                        className="w-full max-h-40 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          Video uploaded successfully.
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {getFormattedDuration(selectedLesson.durationSeconds)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800"
                    >
                      Replace Video
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => !lessonVideoUploading && videoInputRef.current?.click()}
                    className={`border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 rounded-xl p-6 text-center cursor-pointer hover:border-violet-500 transition ${
                      lessonVideoUploading ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    {lessonVideoUploading ? (
                      <div className="space-y-2.5 flex flex-col items-center w-full">
                        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-medium text-zinc-650 dark:text-zinc-300">Uploading Video ({lessonVideoProgress}%)</p>
                        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${lessonVideoProgress}%` }} />
                        </div>
                        {cancelVideoUpload && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelVideoUpload();
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-700 mt-1 cursor-pointer"
                          >
                            Cancel Upload
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-zinc-400 mx-auto" />
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Upload MP4 Video</p>
                        <p className="text-[10px] text-zinc-400">Up to 500MB</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lesson Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</label>
                <textarea
                  rows={4}
                  value={selectedLesson.description || ""}
                  onChange={(e) => updateLesson({ ...selectedLesson, description: e.target.value }, false)}
                  onBlur={() => updateLesson(selectedLesson)}
                  placeholder="Describe what students will learn in this lesson..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Free Preview</span>
                  <input
                    type="checkbox"
                    checked={selectedLesson.isPreview || false}
                    onChange={(e) => updateLesson({ ...selectedLesson, isPreview: e.target.checked, isFree: e.target.checked })}
                    className="accent-violet-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Publish Lesson</span>
                  <input
                    type="checkbox"
                    checked={selectedLesson.isPublished || false}
                    onChange={(e) => updateLesson({ ...selectedLesson, isPublished: e.target.checked })}
                    className="accent-violet-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Lecture Resources Section */}
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Lecture Resources</label>
                
                {/* Resources List */}
                {fetchingResources ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading resources...</span>
                  </div>
                ) : resources.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {resources.map((res: any) => (
                      <div key={res._id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-xs border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 truncate">
                          {res.type === 'link' ? (
                            <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          ) : res.type === 'pdf' ? (
                            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          ) : res.type === 'image' ? (
                            <FileText className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                          )}
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate" title={res.title}>
                            {res.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(res._id)}
                          className="text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-850"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 italic">No resources added yet.</p>
                )}

                {/* Add Resource Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => resourceFileInputRef.current?.click()}
                      disabled={uploadingResource}
                      className="text-[10px] h-8 rounded-lg"
                    >
                      {uploadingResource ? "Uploading..." : "Upload File"}
                    </Button>
                    <input
                      type="file"
                      ref={resourceFileInputRef}
                      onChange={handleResourceFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => setShowAddLink(!showAddLink)}
                      className="text-[10px] h-8 rounded-lg"
                    >
                      {showAddLink ? "Cancel Link" : "Add Link"}
                    </Button>
                  </div>

                  {showAddLink && (
                    <div className="p-2 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 space-y-2">
                      <input
                        type="text"
                        placeholder="Link Title"
                        value={resourceLinkTitle}
                        onChange={(e) => setResourceLinkTitle(e.target.value)}
                        className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-900 dark:text-white outline-none"
                      />
                      <input
                        type="url"
                        placeholder="URL (https://...)"
                        value={resourceLinkUrl}
                        onChange={(e) => setResourceLinkUrl(e.target.value)}
                        className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-900 dark:text-white outline-none"
                      />
                      <Button
                        size="sm"
                        type="button"
                        onClick={handleAddLinkResource}
                        disabled={!resourceLinkTitle.trim() || !resourceLinkUrl.trim()}
                        className="w-full text-[10px] h-7 bg-violet-600 hover:bg-violet-750 text-white rounded-md"
                      >
                        Save Link
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl py-12">
              <p className="text-xs text-zinc-400">Select a lesson to edit its metadata, video asset, and release settings.</p>
            </Card>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={resourceIdToDelete !== null}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        onConfirm={handleConfirmDeleteResource}
        onCancel={() => setResourceIdToDelete(null)}
      />

      <ConfirmModal
        isOpen={moduleIdToDelete !== null}
        title="Delete Module"
        message="Are you sure you want to delete this module and all its lessons? This action cannot be undone."
        onConfirm={handleConfirmDeleteModule}
        onCancel={() => setModuleIdToDelete(null)}
      />

      <ConfirmModal
        isOpen={lessonIdToDelete !== null}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        onConfirm={handleConfirmDeleteLesson}
        onCancel={() => setLessonIdToDelete(null)}
      />
    </div>
  );
}
