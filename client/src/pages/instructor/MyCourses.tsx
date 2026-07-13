import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  Search,
  LayoutGrid,
  List,
  Star,
} from "lucide-react";
import type { Course } from "../../api/courseApi";
import { useEffect, useMemo } from "react";

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getMyCourses();
        console.log(data);

        if (data) setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) => !search || c.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [courses, search],
  );

  const handleDelete = async (id: string) => {
    if (
      !confirm("Delete this course and all its content? This cannot be undone.")
    )
      return;
    try {
      await courseService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage, edit, and track all your published & draft courses.
          </p>
        </div>
        <Button
          onClick={() => navigate("/course/create")}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-500/10"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-lg transition ${view === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm text-violet-600" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg transition ${view === "list" ? "bg-white dark:bg-zinc-700 shadow-sm text-violet-600" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <Card className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-violet-600" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-white mb-1">
            {search ? "No matching courses" : "No courses yet"}
          </h3>
          <p className="text-sm text-zinc-500 mb-6">
            {search
              ? "Try adjusting your search."
              : "Create your first course to get started."}
          </p>
          {!search && (
            <Button
              onClick={() => navigate("/course/create")}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Course
            </Button>
          )}
        </Card>
      )}

      {/* Grid View */}
      {!loading && filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <Card
              key={course._id}
              className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="relative h-40 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={
                    course.thumbnailUrl ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
                  }
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant={course.isPublished ? "success" : "neutral"}
                    className="text-[10px] rounded-lg px-2 py-0.5 shadow-sm"
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-2">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                      {course.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">
                      {(course.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-zinc-400">
                      · {course.enrollmentCount || 0} students
                    </span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    ${course.price}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/instructor/course/${course._id}/manage`)
                    }
                    className="flex-1 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 h-8"
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(`/course/${course.slug}`, "_blank")
                    }
                    className="text-xs rounded-lg border-zinc-200 dark:border-zinc-800 h-8 px-2.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(course._id)}
                    className="text-xs rounded-lg border-zinc-200 dark:border-zinc-800 h-8 px-2.5 text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900/50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && filtered.length > 0 && view === "list" && (
        <Card className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            course.thumbnailUrl ||
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=40&fit=crop"
                          }
                          alt=""
                          className="w-12 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate max-w-[240px]">
                          {course.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={course.isPublished ? "success" : "neutral"}
                        className="text-[10px] rounded px-2 py-0.5"
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                      {course.enrollmentCount || 0}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {(course.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      ${course.price}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/instructor/course/${course._id}/manage`)
                          }
                          className="text-xs rounded-lg h-8 border-zinc-200 dark:border-zinc-800"
                        >
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(course._id)}
                          className="text-xs rounded-lg h-8 border-zinc-200 dark:border-zinc-800 text-red-500 hover:border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
