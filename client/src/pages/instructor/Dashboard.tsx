import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MessageCircle,
  ClipboardList,
  Megaphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import type { Course } from "../../api/courseApi";

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getMyCourses();
        if (data) {
          setCourses(data);
        }
      } catch (err) {
        console.error("Error fetching courses for dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Compute stats dynamically from the actual course list
  const totalCourses = courses.length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
  const averageRating = totalCourses > 0 
    ? parseFloat((courses.reduce((sum, c) => sum + (c.rating || 0), 0) / totalCourses).toFixed(1))
    : 4.8; // Default fallback
  const totalRevenue = courses.reduce((sum, c) => sum + ((c.enrollmentCount || 0) * (c.price || 0)), 0);

  const stats = [
    {
      title: "Total Revenue",
      value: totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : "$0.00",
      change: "+12.5%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600 shadow-emerald-500/20",
    },
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      change: "+8.2%",
      icon: Users,
      color: "from-blue-500 to-indigo-600 shadow-blue-500/20",
    },
    {
      title: "Active Courses",
      value: totalCourses.toLocaleString(),
      change: `+${totalCourses} courses`,
      icon: BookOpen,
      color: "from-violet-500 to-purple-600 shadow-violet-500/20",
    },
    {
      title: "Average Rating",
      value: averageRating.toString(),
      change: "Stable",
      icon: Star,
      color: "from-amber-500 to-orange-600 shadow-amber-500/20",
    },
  ];

  // Dynamic top courses sorted by enrollment
  const topCourses = [...courses]
    .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
    .slice(0, 5);

  // Mock enrollments since there's no backend instructor dashboard analytics yet
  const recentEnrollments = [
    { id: "e1", studentName: "Ananya Sharma", courseTitle: courses[0]?.title || "Full-Stack Web BootCamp", date: "Today" },
    { id: "e2", studentName: "Rohan Das", courseTitle: courses[1]?.title || "UI/UX Figma BootCamp", date: "Yesterday" },
    { id: "e3", studentName: "Lisa Miller", courseTitle: courses[0]?.title || "Full-Stack Web BootCamp", date: "2 days ago" },
  ];

  // Mock reviews
  const recentReviews = [
    { id: "r1", name: "Ananya Sharma", rating: 5, comment: "Absolutely loved the section on React design systems. It was super practical and easy to follow!", course: courses[0]?.title || "Full-Stack Web BootCamp" },
    { id: "r2", name: "Rohan Das", rating: 4.5, comment: "Very detailed pricing model guidelines. Highly recommended for beginners.", course: courses[1]?.title || "UI/UX Figma BootCamp" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white overflow-hidden shadow-lg shadow-violet-500/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, Instructor!</h1>
          <p className="text-violet-100 text-sm sm:text-base max-w-xl">
            Manage your student dashboard, update syllabus courses, and review recent community questions.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{stat.title}</span>
                  <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{stat.value}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stat.change}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">this month</span>
                  </div>
                </div>
                <div className={`p-3.5 bg-gradient-to-br ${stat.color} rounded-2xl text-white shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Quick Shortcuts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/course/create")}
            className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-violet-500/30 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Create Course</span>
          </button>

          <button
            onClick={() => navigate("/instructor/announcements")}
            className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-violet-500/30 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Megaphone className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Announcements</span>
          </button>

          <button
            onClick={() => navigate("/instructor/assignments")}
            className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-violet-500/30 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <ClipboardList className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Assignments</span>
          </button>

          <button
            onClick={() => navigate("/instructor/community")}
            className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-violet-500/30 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <MessageCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Q&A Forums</span>
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Courses */}
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Top Performing Courses</h2>
            <TrendingUp className="w-4.5 h-4.5 text-zinc-400" />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : topCourses.length > 0 ? (
              topCourses.map((course, idx) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/instructor/course/${course._id}/manage`)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850/50 cursor-pointer transition-colors duration-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <img
                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=60&fit=crop"}
                    alt=""
                    className="w-12 h-8 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">{course.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{course.enrollmentCount || 0} students enrolled</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-250">{(course.rating || 4.8).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-400 text-sm">
                No courses yet. Click "Create Course" to get started!
              </div>
            )}
          </div>
        </Card>

        {/* Recent Enrollments */}
        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Recent Enrollments</h2>
            <Users className="w-4.5 h-4.5 text-zinc-400" />
          </div>

          <div className="space-y-4">
            {recentEnrollments.map((enr) => (
              <div
                key={enr.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30"
              >
                <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {enr.studentName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">{enr.studentName}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 truncate">Enrolled in: {enr.courseTitle}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{enr.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">Recent Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentReviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-900/10 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">{rev.name}</h4>
                    <p className="text-[9px] text-zinc-400 truncate max-w-[200px]">{rev.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-250">{rev.rating}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
