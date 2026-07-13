import { StepIndicator } from "./StepIndicator";

interface Props {
  title: string;
  onChange: (v: string) => void;
  total?: number;
}

export function StepOne({ title, onChange, total = 2 }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <StepIndicator current={1} total={total} />
      
      <div className="space-y-2 mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          What is the working title?
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Give your course a clear, concise working title. You can always change it later in settings.
        </p>
      </div>

      <div className="space-y-2 mt-6">
        <label htmlFor="course-title" className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Course Title
        </label>
        <input
          id="course-title"
          type="text"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Complete Web Development Bootcamp"
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3.5 text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm"
        />
      </div>
    </div>
  );
}
