import { useState, useEffect, useCallback } from 'react';

export interface CourseProgress {
  progress: number;
  lastAccessed: string;
  completedLessons: string[];
}

export interface AppState {
  cart: string[];
  wishlist: string[];
  enrolledCourses: string[];
  courseProgress: Record<string, CourseProgress>;
}

export const useAppState = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('kvault_app_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          cart: [],
          wishlist: [],
          enrolledCourses: [],
          courseProgress: {},
        };
      }
    }
    return {
      cart: [],
      wishlist: [],
      enrolledCourses: [],
      courseProgress: {},
    };
  });

  useEffect(() => {
    localStorage.setItem('kvault_app_state', JSON.stringify(state));
  }, [state]);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleCart = useCallback((courseId: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.includes(courseId)
        ? prev.cart.filter(id => id !== courseId)
        : [...prev.cart, courseId],
    }));
  }, []);

  const toggleWishlist = useCallback((courseId: string) => {
    setState(prev => ({
      ...prev,
      wishlist: prev.wishlist.includes(courseId)
        ? prev.wishlist.filter(id => id !== courseId)
        : [...prev.wishlist, courseId],
    }));
  }, []);

  const addToEnrolled = useCallback((courseIds: string[]) => {
    setState(prev => ({
      ...prev,
      enrolledCourses: [...new Set([...prev.enrolledCourses, ...courseIds])],
    }));
  }, []);

  const updateCourseProgress = useCallback((
    courseId: string,
    progress: number,
    lastAccessed: string,
    completedLessons: string[]
  ) => {
    setState(prev => ({
      ...prev,
      courseProgress: {
        ...prev.courseProgress,
        [courseId]: {
          progress,
          lastAccessed,
          completedLessons,
        },
      },
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, cart: [] }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      cart: [],
      wishlist: [],
      enrolledCourses: [],
      courseProgress: {},
    });
  }, []);

  return {
    state,
    updateState,
    toggleCart,
    toggleWishlist,
    addToEnrolled,
    updateCourseProgress,
    clearCart,
    resetState,
  };
};