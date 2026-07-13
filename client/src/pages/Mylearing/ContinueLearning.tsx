import { memo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Play } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import type { Course } from "../../api/courseApi";
import { ProgressBar } from "./ProgressBar";
import { getCoursePlayerPath } from "../../routes/routeConfig";
import { formatDuration } from "../../utils/Helping";

export interface CourseProgressInfo {
  progress: number;
  lastAccessed: string;
  completedLessons: string[];
}

interface ContinueLearningProps {
  courses: Course[];
  progressByCourseId: Record<string, CourseProgressInfo>;
  lastWatchedByCourseId?: Record<string, any>;
  loading?: boolean;
}

interface CourseCardItemProps {
  course: Course;
  index: number;
  progressInfo?: CourseProgressInfo;
  lastWatched?: any;
}

const getLessonId = (lesson: any): string | undefined => {
  return typeof lesson === "string" ? lesson : lesson?._id;
};

function CourseCardItem({ course, index, progressInfo, lastWatched }: CourseCardItemProps) {
  const progress = progressInfo?.progress || 0;
  const completedLessons = progressInfo?.completedLessons.length || 0;

  const lastAccessed = progressInfo?.lastAccessed || "Not started yet";
  const thumbnailUrl = course.thumbnailUrl;
  const isCompleted = progress === 100;
  const playerPath = getCoursePlayerPath(course.slug, getLessonId(lastWatched));

  const lastLessonTitle =
    typeof lastWatched === "string"
      ? lastAccessed
      : (lastWatched as any)?.title || lastAccessed;

  return (
    <article
      className="animate-fade-up group relative overflow-hidden rounded-3xl border border-brand-border bg-bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-secondary">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-purple/20 to-brand-blue/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
        <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          {formatDuration(course.duration)}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-semibold leading-snug tracking-tight text-brand-navy">
            {course.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            Last lesson:{" "}
            <span className="font-semibold">{lastLessonTitle}</span>
          </p>
        </div>

        <div className="space-y-2">
          <ProgressBar value={progress} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {completedLessons}/{course.totalLessons} lessons · {progress}% complete
            </span>

            {isCompleted ? (
              <Link
                to={playerPath}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-all hover:bg-emerald-100 hover:scale-105"
              >
                <Play className="h-3 w-3 fill-current" />
                Play
              </Link>
            ) : (
              <Link
                to={playerPath}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-soft"
              >
                <Play className="h-3 w-3 fill-current" />
                Resume
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

const MemoCard = memo(CourseCardItem);

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-brand-border bg-bg-card">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContinueLearning({
  courses,
  progressByCourseId,
  lastWatchedByCourseId = {},
  loading = false,
}: ContinueLearningProps) {
  if (!loading && courses.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-brand-navy">
            Continue learning
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick up where you left off.
          </p>
        </div>
        <Link
          to="/my-learning"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          : courses.map((course, index) => (
              <MemoCard
                key={course._id}
                course={course}
                index={index}
                progressInfo={progressByCourseId[course._id]}
                lastWatched={lastWatchedByCourseId[course._id]}
              />
            ))}
      </div>
    </section>
  );
}
