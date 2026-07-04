import { useState, useEffect } from 'react';
import { Award, Loader2 } from 'lucide-react';
import EmptyState from './EmptyState';
import { userService } from '../../services/userService';

interface Achievement {
  courseId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  certificateIssued: boolean;
  certificateUrl?: string;
}

export default function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAchievements();
      if (response.success && response.data) {
        setAchievements(response.data.achievements || []);
      } else {
        setError('Failed to load achievements');
      }
    } catch (err) {
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const totalCertificates = achievements.length;
  const completedCertificates = achievements.filter(a => a.isCompleted).length;

  if (achievements.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
              <p className="text-2xl font-bold text-foreground">{totalCertificates}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Certificates</p>
              <p className="text-2xl font-bold text-foreground">{completedCertificates}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Certificate Details
        </h3>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.courseId}
              className="flex items-center justify-between rounded-lg border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  achievement.isCompleted 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Course ID: {achievement.courseId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Progress: {achievement.progress}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                {achievement.isCompleted ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}