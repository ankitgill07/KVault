import { useState, useRef } from "react";
import { Card, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Plus,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  GripVertical,
  X,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Upload,
  Play,
  Loader2,
} from "lucide-react";
import type { Module } from "../../../api/moduleApi";
import type { Lesson } from "../../../api/lessonApi";

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
  const getFormattedDuration = (durationSeconds?: number) =>
    typeof durationSeconds === "number" ? formatDuration(durationSeconds) : "0s";

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
                        onClick={() => deleteModule(module._id)}
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
                                  deleteLesson(module._id, lesson._id);
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
                        src={selectedLesson.videoUrl}
                        controls
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
            </Card>
          ) : (
            <Card className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl py-12">
              <p className="text-xs text-zinc-400">Select a lesson to edit its metadata, video asset, and release settings.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
