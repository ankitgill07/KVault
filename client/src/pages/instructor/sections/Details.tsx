import { Card, CardDescription, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import type { CourseFormData } from "../../../hooks/useCreateCourses";

interface Props {
  course: CourseFormData;
  setCourse: React.Dispatch<React.SetStateAction<CourseFormData>>;
  saving: boolean;
  onSave: () => Promise<void>;
}

export function Details({ course, setCourse, saving, onSave }: Props) {
  const outcomes = course.learningOutcomes || [];
  const requirements = course.requirements || [];
  const audience = course.targetAudience || [];

  const updateList = (field: "learningOutcomes" | "requirements" | "targetAudience", index: number, value: string) => {
    setCourse((prev) => {
      const list = [...(prev[field] || [])];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field: "learningOutcomes" | "requirements" | "targetAudience") => {
    setCourse((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const removeListItem = (field: "learningOutcomes" | "requirements" | "targetAudience", index: number) => {
    setCourse((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Course Requirements & Objectives</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Define requirements, objectives, and targeted developers for your syllabus.
          </p>
        </div>
        <Button onClick={onSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Details"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Learning Outcomes */}
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <div className="mb-4">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">Learning Outcomes</CardTitle>
            <CardDescription className="text-sm text-zinc-500">
              What milestones or skills will developers achieve by completing your syllabus?
            </CardDescription>
          </div>
          
          <div className="space-y-3">
            {outcomes.map((item, i) => (
              <div key={i} className="flex items-center gap-3 animate-in fade-in duration-200">
                <span className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateList("learningOutcomes", i, e.target.value)}
                  placeholder="e.g. Build enterprise-grade React design systems"
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("learningOutcomes", i)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addListItem("learningOutcomes")}
              className="inline-flex items-center gap-2 mt-2 text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Outcome
            </button>
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <div className="mb-4">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">Requirements</CardTitle>
            <CardDescription className="text-sm text-zinc-500">
              What prerequisites, knowledge, or tools are required before starting?
            </CardDescription>
          </div>

          <div className="space-y-3">
            {requirements.map((item, i) => (
              <div key={i} className="flex items-center gap-3 animate-in fade-in duration-200">
                <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateList("requirements", i, e.target.value)}
                  placeholder="e.g. Basic understanding of JavaScript and ES6 features"
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("requirements", i)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addListItem("requirements")}
              className="inline-flex items-center gap-2 mt-2 text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Requirement
            </button>
          </div>
        </Card>

        {/* Target Audience */}
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <div className="mb-4">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">Target Audience</CardTitle>
            <CardDescription className="text-sm text-zinc-500">
              Who is this syllabus designed for? Who will benefit most?
            </CardDescription>
          </div>

          <div className="space-y-3">
            {audience.map((item, i) => (
              <div key={i} className="flex items-center gap-3 animate-in fade-in duration-200">
                <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateList("targetAudience", i, e.target.value)}
                  placeholder="e.g. Frontend developers looking to level up their React skills"
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("targetAudience", i)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addListItem("targetAudience")}
              className="inline-flex items-center gap-2 mt-2 text-sm text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Target Audience
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
