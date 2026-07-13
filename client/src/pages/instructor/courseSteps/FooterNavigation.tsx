import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface Props {
  onPrevious: () => void;
  onContinue: () => void;
  canContinue?: boolean;
  previousDisabled?: boolean;
  continueLabel?: string;
}

export function FooterNavigation({
  onPrevious,
  onContinue,
  canContinue = true,
  previousDisabled = false,
  continueLabel = "Continue",
}: Props) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-5">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={previousDisabled}
          className="flex items-center gap-2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl px-5 h-11"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 h-11 transition-all duration-200 shadow-md shadow-violet-500/10 hover:shadow-lg disabled:opacity-40 disabled:hover:bg-violet-600"
        >
          {continueLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
