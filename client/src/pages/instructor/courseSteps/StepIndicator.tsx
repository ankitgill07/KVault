export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Step {current} of {total}
        </span>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {Math.round((current / total) * 100)}% complete
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-violet-600 dark:bg-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
