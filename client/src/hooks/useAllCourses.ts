import { useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';
import type { Course } from '../api/courseApi';

interface UseAllCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Cache to store courses and avoid multiple API calls
let coursesCache: Course[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAllCourses = (): UseAllCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if cache is valid
      const now = Date.now();
      if (coursesCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setCourses(coursesCache);
        setLoading(false);
        return;
      }

      // Fetch all courses from API
      const fetchedCourses = await courseService.getAllCourses({
        limit: 1000, // Get all courses
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      // Map API response to Course type
const mappedCourses: Course[] = fetchedCourses.map((course: any) => ({
  _id: course._id,
  title: course.title,
  description: course.description,
  slug: course.slug,
  level: course.level || "Beginner",
  language: course.language || "English",
  duration: course.duration || 0,
  totalLessons: course.totalLessons || course.lessonsCount || 0,
  totalModules: course.totalModules || 0,
  price: course.price || 0,
  discountPrice: course.discountPrice,
  previewVideo: course.previewVideo || "",
  thumbnail: course.thumbnail || course.image || "",
  requirements: course.requirements || [],
  learningOutcomes: course.learningOutcomes || [],
  rating: course.rating || 0,
  enrollmentCount: course.enrollmentCount || 0,
  reviewCount: course.reviewCount || 0,
  category: course.category,
  instructors: course.instructors || [],
  instructorAvatar:
    course.instructorAvatar ||
    "https://ui-avatars.com/api/?name=Instructor&background=667eea&color=fff",
  primaryInstructor: course.primaryInstructor,
}));

      // Update cache
      coursesCache = mappedCourses;
      cacheTimestamp = now;

      setCourses(mappedCourses);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  };
};

export default useAllCourses;