import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { progressApi } from "../api/progressApi";
import type { LessonProgressData, RecentlyWatchedItem } from "../api/progressApi";

interface ProgressState {
  lessonProgress: Record<string, LessonProgressData>; // key: lessonId
  courseProgresses: Record<string, number>; // key: courseId
  completedLessonsList: Record<string, string[]>; // key: courseId, value: completed lesson IDs
  recentlyWatched: RecentlyWatchedItem[];
  lastWatched: Record<string, any>; // key: courseId
  isLoading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  lessonProgress: {},
  courseProgresses: {},
  completedLessonsList: {},
  recentlyWatched: [],
  lastWatched: {},
  isLoading: false,
  error: null,
};

export const fetchCourseProgress = createAsyncThunk(
  "progress/fetchCourseProgress",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await progressApi.getCourseProgress(courseId);
      return { courseId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch progress"
      );
    }
  }
);

export const updateVideoProgress = createAsyncThunk(
  "progress/updateVideoProgress",
  async (
    payload: {
      courseId: string;
      lessonId: string;
      currentTime: number;
      duration: number;
      completed?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await progressApi.updateVideoProgress({
        courseId: payload.courseId,
        lessonId: payload.lessonId,
        currentTime: payload.currentTime,
        completed: payload.completed,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update progress"
      );
    }
  }
);

export const fetchRecentlyWatched = createAsyncThunk(
  "progress/fetchRecentlyWatched",
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressApi.getRecentlyWatched();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch recently watched"
      );
    }
  }
);

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    clearProgressError: (state) => {
      state.error = null;
    },
    // Allows immediate front-end only updates
    setLocalLessonProgress: (
      state,
      action: PayloadAction<{
        lessonId: string;
        watchedSeconds: number;
        completed: boolean;
        completedPercentage: number;
      }>
    ) => {
      const { lessonId, watchedSeconds, completed, completedPercentage } = action.payload;
      state.lessonProgress[lessonId] = {
        lessonId,
        watchedSeconds,
        completed,
        completedPercentage,
        lastWatchedAt: new Date().toISOString(),
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch Course Progress
    builder
      .addCase(fetchCourseProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        const { courseId, data } = action.payload;
        state.courseProgresses[courseId] = data.courseProgress;
        state.lastWatched[courseId] = data.lastWatched;

        // Merge lesson progress items
        const completedIds: string[] = [];
        if (data.lessonProgress) {
          Object.entries(data.lessonProgress).forEach(([lid, p]: [string, any]) => {
            state.lessonProgress[lid] = {
              lessonId: lid,
              watchedSeconds: p.watchedSeconds,
              completed: p.completed,
              completedPercentage: p.completedPercentage,
              lastWatchedAt: p.lastWatchedAt,
            };
            if (p.completed) {
              completedIds.push(lid);
            }
          });
        }
        state.completedLessonsList[courseId] = completedIds;
      })
      .addCase(fetchCourseProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Video Progress (Optimistic Update in pending phase)
    builder
      .addCase(updateVideoProgress.pending, (state, action) => {
        const { courseId, lessonId, currentTime, duration, completed } = action.meta.arg;
        let completedPercentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
        if (completedPercentage > 100) completedPercentage = 100;
        const existingProgress = state.lessonProgress[lessonId];
        const wasCompleted =
          Boolean(existingProgress?.completed) ||
          Boolean(state.completedLessonsList[courseId]?.includes(lessonId));
        const isCompleted = wasCompleted || completed || completedPercentage >= 90;
        const watchedSeconds = Math.max(existingProgress?.watchedSeconds || 0, currentTime);
        const bestCompletedPercentage = isCompleted
          ? 100
          : Math.max(existingProgress?.completedPercentage || 0, completedPercentage);

        state.lessonProgress[lessonId] = {
          lessonId,
          watchedSeconds,
          completed: isCompleted,
          completedPercentage: bestCompletedPercentage,
          lastWatchedAt: new Date().toISOString(),
        };

        if (isCompleted) {
          if (!state.completedLessonsList[courseId]) {
            state.completedLessonsList[courseId] = [];
          }
          if (!state.completedLessonsList[courseId].includes(lessonId)) {
            state.completedLessonsList[courseId].push(lessonId);
          }
        }
      })
      .addCase(updateVideoProgress.fulfilled, (state, action) => {
        const { lessonProgress, courseProgress } = action.payload.data;
        const courseId = action.meta.arg.courseId;
        const lessonId = lessonProgress.lessonId;
        const existingProgress = state.lessonProgress[lessonId];
        const wasCompleted =
          Boolean(existingProgress?.completed) ||
          Boolean(state.completedLessonsList[courseId]?.includes(lessonId));
        const isCompleted = wasCompleted || lessonProgress.completed;

        state.lessonProgress[lessonId] = {
          ...lessonProgress,
          watchedSeconds: Math.max(
            existingProgress?.watchedSeconds || 0,
            lessonProgress.watchedSeconds || 0
          ),
          completed: isCompleted,
          completedPercentage: isCompleted
            ? 100
            : Math.max(
                existingProgress?.completedPercentage || 0,
                lessonProgress.completedPercentage || 0
              ),
        };
        state.courseProgresses[courseId] = Math.max(
          state.courseProgresses[courseId] || 0,
          courseProgress || 0
        );

        if (!state.completedLessonsList[courseId]) {
          state.completedLessonsList[courseId] = [];
        }
        if (isCompleted && !state.completedLessonsList[courseId].includes(lessonId)) {
          state.completedLessonsList[courseId].push(lessonId);
        }
      })
      .addCase(updateVideoProgress.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Recently Watched
    builder
      .addCase(fetchRecentlyWatched.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchRecentlyWatched.fulfilled, (state, action) => {
        state.recentlyWatched = action.payload;
      })
      .addCase(fetchRecentlyWatched.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearProgressError, setLocalLessonProgress } = progressSlice.actions;

export default progressSlice.reducer;
