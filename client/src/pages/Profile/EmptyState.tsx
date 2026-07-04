import { Award } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-50 to-purple-100 ring-8 ring-violet-50/50">
          <Award className="h-10 w-10 text-violet-400" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground">No achievements yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Complete courses and earn certificates to showcase your accomplishments.
      </p>
    </div>
  );
}
