import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { enrollmentService } from "../services/enrollmentService";
import type { Enrollment } from "../api/enrollmentApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrollmentState {
  enrollments: Enrollment[];
  activeEnrollmentId: string | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyEnrollments = createAsyncThunk(
  "enrollment/fetchMyEnrollments",
  async (_, { rejectWithValue }) => {
    try {
      const enrollments = await enrollmentService.getMyEnrollments();
      return enrollments;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch enrollments");
    }
  },
);

export const enrollInCourse = createAsyncThunk(
  "enrollment/enrollInCourse",
  async (data: { course: string; amountPaid: number }, { rejectWithValue }) => {
    try {
      const enrollment = await enrollmentService.enrollInCourse(data);
      return enrollment;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to enroll in course");
    }
  },
);

export const updateCourseProgress = createAsyncThunk(
  "enrollment/updateCourseProgress",
  async (
    data: {
      courseId: string;
      lessonId?: string;
      moduleId?: string;
      progress?: number;
      lastAccessed?: string;
      completedLessons?: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await enrollmentService.updateProgress(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update progress");
    }
  },
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: EnrollmentState = {
  enrollments: [],
  activeEnrollmentId: null,
  isLoading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    setActiveEnrollment: (state, action: PayloadAction<string | null>) => {
      state.activeEnrollmentId = action.payload;
    },
    clearEnrollmentError: (state) => {
      state.error = null;
    },
    resetEnrollmentState: (state) => {
      state.enrollments = [];
      state.activeEnrollmentId = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch My Enrollments
    builder
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Enroll in Course
    builder
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.enrollments.push(action.payload);
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Course Progress
    builder
      .addCase(updateCourseProgress.fulfilled, (state, action) => {
        const { progress, completedLessons, lastAccessed } = action.payload;
        const courseId = action.meta.arg.courseId;
        const enrollmentIndex = state.enrollments.findIndex(
          (e) => {
            // Handle both string course ID and populated course object
            const courseIdValue = typeof e.course === 'string' 
              ? e.course 
              : (e.course as any)?._id || (e.course as any)?.id || String(e.course);
            return courseIdValue === courseId;
          },
        );

        if (enrollmentIndex !== -1) {
          state.enrollments[enrollmentIndex].progress = progress;
          state.enrollments[enrollmentIndex].completedLessons =
            completedLessons;
          if (lastAccessed) {
            state.enrollments[enrollmentIndex].lastAccessed = lastAccessed;
          }
        }
      })
      .addCase(updateCourseProgress.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  setActiveEnrollment,
  clearEnrollmentError,
  resetEnrollmentState,
} = enrollmentSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectEnrollments = (state: { enrollment: EnrollmentState }) =>
  state.enrollment.enrollments;
export const selectActiveEnrollmentId = (state: {
  enrollment: EnrollmentState;
}) => state.enrollment.activeEnrollmentId;
export const selectEnrollmentLoading = (state: {
  enrollment: EnrollmentState;
}) => state.enrollment.isLoading;
export const selectEnrollmentError = (state: { enrollment: EnrollmentState }) =>
  state.enrollment.error;

export const selectActiveEnrollment = (state: {
  enrollment: EnrollmentState;
}) => {
  const { enrollments, activeEnrollmentId } = state.enrollment;
  return enrollments.find((e) => e._id === activeEnrollmentId) || null;
};

export const selectEnrollmentCount = (state: { enrollment: EnrollmentState }) =>
  state.enrollment.enrollments.length;

export const selectCompletedEnrollments = (state: {
  enrollment: EnrollmentState;
}) => state.enrollment.enrollments.filter((e) => e.progress === 100);

export const selectEnrollmentByCourseId =
  (courseId: string) => (state: { enrollment: EnrollmentState }) =>
    state.enrollment.enrollments.find((e) => {
      // Handle both string course ID and populated course object
      const courseIdValue = typeof e.course === 'string' 
        ? e.course 
        : (e.course as any)?._id || (e.course as any)?.id || String(e.course);
      return courseIdValue === courseId;
    }) || null;

// ─── Reducer ──────────────────────────────────────────────────────────────────

export default enrollmentSlice.reducer;
