import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import type { Course } from '../../api/courseApi';
import {
  DollarSign, Users, Star, TrendingUp, CheckCircle, BarChart3,
  ArrowLeft, BookOpen
} from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getMyCourses();
        if (data) setCourses(data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const totalStudents = courses.reduce((s, c) => s + (c.enrollmentCount || 0), 0);
  const totalRevenue = courses.reduce((s, c) => s + (c.enrollmentCount || 0) * (c.price || 0), 0);
  const avgRating = courses.length > 0
    ? (courses.reduce((s, c) => s + (c.rating || 0), 0) / courses.length).toFixed(1)
    : '0.0';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyData = months.map((month, i) => ({
    month,
    revenue: Math.round(totalRevenue * (0.1 + i * 0.15)),
    enrollments: Math.round(totalStudents * (0.1 + i * 0.15)),
  }));

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);
  const maxEnroll = Math.max(...monthlyData.map(d => d.enrollments), 1);

  const stats = [
    { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-600 shadow-emerald-500/20' },
    { title: 'Total Students', value: totalStudents.toLocaleString(), icon: Users, color: 'from-blue-500 to-indigo-600 shadow-blue-500/20' },
    { title: 'Avg. Rating', value: avgRating, icon: Star, color: 'from-amber-500 to-orange-600 shadow-amber-500/20' },
    { title: 'Active Courses', value: courses.length.toString(), icon: BookOpen, color: 'from-violet-500 to-purple-600 shadow-violet-500/20' },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-zinc-100 dark:bg-zinc-800" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/instructor')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Analytics Overview</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Performance insights across all your courses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3.5 bg-gradient-to-br ${stat.color} rounded-2xl text-white shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-zinc-900 dark:text-white">Monthly Revenue</h3>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="h-48 flex items-end gap-3 pb-4">
            {monthlyData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg transition-all duration-500 hover:from-violet-500"
                  style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` }}
                />
                <span className="text-[10px] font-medium text-zinc-400">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-zinc-900 dark:text-white">Monthly Enrollments</h3>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="h-48 flex items-end gap-3 pb-4">
            {monthlyData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.max((d.enrollments / maxEnroll) * 100, 4)}%` }}
                />
                <span className="text-[10px] font-medium text-zinc-400">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Course Performance Table */}
      <Card className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <h3 className="font-bold text-zinc-900 dark:text-white">Course Performance</h3>
        </div>
        {courses.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-sm">No courses yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Course</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Students</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {courses.map(course => (
                  <tr key={course._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition cursor-pointer" onClick={() => navigate(`/instructor/course/${course._id}/manage`)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=40&fit=crop'} alt="" className="w-12 h-8 rounded object-cover flex-shrink-0" />
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{course.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{course.enrollmentCount || 0}</td>
                    <td className="px-4 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">${((course.enrollmentCount || 0) * (course.price || 0)).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{(course.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={course.isPublished ? 'success' : 'neutral'} className="text-[10px] rounded px-2 py-0.5">
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
