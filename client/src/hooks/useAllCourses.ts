import { useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';
import type { Course } from '../data/courses';

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
      const response = await courseService.getAllCourses({
        limit: 1000, // Get all courses
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const fetchedCourses = response.courses || [];
      
      // Map API response to Course type
      const mappedCourses: Course[] = fetchedCourses.map((course: any) => ({
        id: course._id,
        slug: course.slug,
        title: course.title,
        instructor: course.instructor?.name || 'Unknown Instructor',
        instructorRole: course.instructorRole || 'Instructor',
        instructorAvatar: course.instructorAvatar || 'https://ui-avatars.com/api/?name=Instructor&background=667eea&color=fff',
        instructorBio: '',
        instructorSocials: {},
        category: course.category?.name || 'General',
        rating: course.rating || 0,
        reviewsCount: course.enrollmentCount || 0,
        duration: course.duration ? `${course.duration} hours` : 'Self-paced',
        lessonsCount: course.lessonsCount || course.totalLessons || 0,
        price: course.price,
        originalPrice: course.originalPrice || Math.round(course.price * 1.5),
        description: course.description,
        gradient: course.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        difficulty: course.level || 'Beginner',
        skills: course.skills || [],
        requirements: [],
        whatYouWillLearn: [],
        lastUpdated: course.updatedAt || '',
        language: 'English',
        studentsCount: course.studentsCount || course.enrollmentCount || 0,
        thumbnail: course.thumbnail || course.image || '',
        chapters: [],
        reviews: [],
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