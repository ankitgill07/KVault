import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { FooterNavigation } from "./FooterNavigation";
import useCreateCourses from "../../../hooks/useCreateCourses";
import { Card } from "../../../components/ui/card";
import { GraduationCap, AlertCircle } from "lucide-react";

const TOTAL_STEPS = 2;

export default function Index() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { course, setCourse, saveCourse, saving, error, categories } =
    useCreateCourses();

  const next = async () => {
    if (step === TOTAL_STEPS) {
      // Create the course in DB!
      // This will trigger creation and automatically redirect to /instructor/course/:id/manage
      await saveCourse();
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const canContinue =
    step === 1
      ? (course.title || "").trim().length > 0
      : step === 2
        ? (course.category || "").length > 0
        : true;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans justify-between transition-colors duration-200">
      {/* Top logo header - minimalist */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-12 sm:px-6">
        <div
          onClick={() => navigate("/instructor/courses")}
          className="flex items-center gap-2 cursor-pointer w-fit group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/10 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Kvault <span className="text-violet-600">LMS</span>
          </span>
        </div>
      </div>

      {/* Main wizard step content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          <Card className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-100/50 dark:shadow-none p-6 sm:p-10 rounded-2xl relative transition-all duration-300">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            )}

            {step === 1 && (
              <StepOne
                title={course.title}
                onChange={(title) => setCourse((c) => ({ ...c, title }))}
                total={TOTAL_STEPS}
              />
            )}

            {step === 2 && (
              <StepTwo
                category={course.category}
                onChange={(category) => setCourse((c) => ({ ...c, category }))}
                total={TOTAL_STEPS}
                categories={categories}
              />
            )}
          </Card>
        </div>
      </main>

      {/* Footer navigation */}
      <FooterNavigation
        onPrevious={prev}
        onContinue={next}
        canContinue={canContinue && !saving}
        previousDisabled={step === 1}
        continueLabel={
          step === TOTAL_STEPS
            ? saving
              ? "Creating..."
              : "Create Course"
            : "Continue"
        }
      />
    </div>
  );
}
