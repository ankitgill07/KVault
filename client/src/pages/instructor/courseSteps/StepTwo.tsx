import { StepIndicator } from "./StepIndicator";
import { CategoryDropdown } from "./CategoryDropdown";
import type { Category } from "../../../api/categoryApi";

interface Props {
  category: string;
  onChange: (v: string) => void;
  total?: number;
  categories: Category[];
}

export function StepTwo({ category, onChange, total = 2, categories }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <StepIndicator current={2} total={total} />
      
      <div className="space-y-2 mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Which category fits best?
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select a category that best matches the syllabus or domain of your course.
        </p>
      </div>

      <div className="mt-6">
        <CategoryDropdown 
          value={category} 
          onChange={onChange} 
          categories={categories} 
        />
      </div>
    </div>
  );
}
