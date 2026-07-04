import { Skeleton } from '../../components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Skeleton className="h-28 rounded-none" />
        <div className="px-6 pb-6">
          <div className="-mt-16 flex justify-center">
            <Skeleton className="h-32 w-32 rounded-full ring-4 ring-white" />
          </div>
          <div className="mt-4 space-y-2 text-center">
            <Skeleton className="mx-auto h-5 w-32" />
            <Skeleton className="mx-auto h-4 w-20" />
            <Skeleton className="mx-auto h-6 w-16 rounded-full" />
          </div>
          <div className="mt-6 space-y-3 border-t pt-5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <Skeleton className="mb-6 h-10 w-48 rounded-full" />
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="border-t pt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
