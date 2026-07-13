import { Play } from "lucide-react";

interface PurchasedCourseCardProps {
  title: string;
  instructor: string;
  cover: string;
  lastLessonNumber?: number;
  lastLessonTitle?: string;
  progressPercent?: number;
  lastWatchedAgo?: string;
  ctaLabel?: string;
  onClick?: () => void;
}

export function PurchasedCourseCard({
  title,
  instructor,
  cover,
  progressPercent = 0,
  lastLessonTitle,
  ctaLabel = "Continue Learning",
  onClick,
}: PurchasedCourseCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative w-full max-w-sm cursor-pointer overflow-hidden rounded-[20px] border border-brand-border bg-bg-card premium-shadow transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:border-brand-purple/20 hover:premium-shadow-hover"
    >
      {/* Hero thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={cover}
          alt={title}
          width={1280}
          height={720}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />

        {/* Subtle overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        {/* Center Play button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          aria-label="Play purchased course"
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/55"
        >
          <Play className="h-5 w-5 fill-current" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-brand-navy">
            {title}
          </h3>
          <p className="text-sm text-brand-gray">by {instructor}</p>
        </div>

        {/* Last lesson info */}
        {lastLessonTitle && (
          <p className="line-clamp-1 text-xs text-brand-gray/80">
            Last lesson: <span className="font-medium text-brand-navy">{lastLessonTitle}</span>
          </p>
        )}
      </div>
    </div>
  );
}
