import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Play, Clock, Trophy, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { fetchMyEnrollments } from "../../store/enrollmentSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { selectEnrollments, selectEnrollmentLoading } from "../../store/enrollmentSlice";
import type { Enrollment } from "../../api/enrollmentApi";

export default function MyCoursesTab() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const enrollments = useSelector(selectEnrollments);
  const isLoading = useSelector(selectEnrollmentLoading);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  useEffect(() => {
    setEnrolledCourses(enrollments);
  }, [enrollments]);

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-green-600 bg-green-50";
    if (progress >= 50) return "text-blue-600 bg-blue-50";
    if (progress > 0) return "text-orange-600 bg-orange-50";
    return "text-gray-600 bg-gray-50";
  };

  const getStatusIcon = (progress: number) => {
    if (progress === 100) return <Trophy className="h-4 w-4" />;
    if (progress > 0) return <BookOpen className="h-4 w-4" />;
    return <Play className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-600">
          <BookOpen className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
          No courses yet
        </h3>
        <p className="mb-4 max-w-sm text-sm text-neutral-500">
          You haven't enrolled in any courses yet. Start learning by exploring our course catalog.
        </p>
        <Button
          onClick={() => navigate("/courses")}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Browse Courses
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">My Courses</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Continue learning from where you left off
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enrolledCourses.map((enrollment) => {
          const course = enrollment.course as any;
          if (!course) return null;

          const progress = enrollment.progress || 0;
          const isCompleted = progress === 100;

          return (
            <Card
              key={enrollment._id}
              className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Course Thumbnail */}
              <div
                className="relative aspect-video w-full cursor-pointer overflow-hidden bg-neutral-100"
                onClick={() => navigate(`/course-player/${course._id}`)}
              >
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-violet-600">
                    <Play className="h-5 w-5 ml-0.5" />
                  </div>
                </div>
                {isCompleted && (
                  <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1.5">
                    <Trophy className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="p-4">
                <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-neutral-900">
                  {course.title}
                </h3>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-neutral-600">Progress</span>
                    <span className="font-semibold text-neutral-900">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500"
                          : progress >= 50
                            ? "bg-blue-500"
                            : "bg-violet-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getProgressColor(
                      progress
                    )}`}
                  >
                    {getStatusIcon(progress)}
                    {isCompleted ? "Completed" : progress > 0 ? "In Progress" : "Not Started"}
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => navigate(`/course-player/${course._id}`)}
                  className={`w-full ${
                    isCompleted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-violet-600 hover:bg-violet-700"
                  }`}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isCompleted ? "Review Course" : "Continue Learning"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
