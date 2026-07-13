import LessonProgress from "../../models/lessonProgressModel.js";
import RecentlyWatched from "../../models/recentlyWatchedModel.js";
import Lesson from "../../models/lessonModel.js";
import Course from "../../models/courseModel.js";

/**
 * Update the lesson-level progress and update recently watched log
 */
export const updateLessonProgress = async (
  studentId: string,
  courseId: string,
  lessonId: string,
  watchedSeconds: number,
  completed?: boolean
): Promise<any> => {
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const duration = lesson.durationSeconds || 0;
    let completedPercentage = duration > 0 ? Math.round((watchedSeconds / duration) * 100) : 0;
    
    if (completedPercentage > 100) {
      completedPercentage = 100;
    }

    const existingProgress = await LessonProgress.findOne({
      student: studentId,
      course: courseId,
      lesson: lessonId,
    });
    const wasCompleted = Boolean(existingProgress?.completed);

    // Mark as completed if percentage is high (>= 90%) or explicitly requested
    const isCompleted =
      wasCompleted || completed || completedPercentage >= 90 || completedPercentage === 100;
    const watchedSecondsToSave = Math.max(
      existingProgress?.watchedSeconds || 0,
      watchedSeconds
    );
    const finalCompletedPercentage = isCompleted
      ? 100
      : Math.max(existingProgress?.completedPercentage || 0, completedPercentage);

    // Upsert LessonProgress
    const progress = await LessonProgress.findOneAndUpdate(
      { student: studentId, course: courseId, lesson: lessonId },
      {
        watchedSeconds: watchedSecondsToSave,
        completed: isCompleted,
        completedPercentage: finalCompletedPercentage,
        lastWatchedAt: new Date(),
      },
      { returnDocument: "after", upsert: true }
    );

    // Upsert RecentlyWatched record to track the last watched timestamp
    await RecentlyWatched.findOneAndUpdate(
      { student: studentId, course: courseId, lesson: lessonId },
      { watchedAt: new Date() },
      { upsert: true, returnDocument: "after" }
    );

    // Calculate dynamic course progress percentage
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedLessonsCount = await LessonProgress.countDocuments({
      student: studentId,
      course: courseId,
      completed: true,
    });

    const courseProgressPercentage = totalLessons > 0 
      ? Math.round((completedLessonsCount / totalLessons) * 100) 
      : 0;

    return {
      success: true,
      lessonProgress: {
        lessonId: progress.lesson,
        watchedSeconds: progress.watchedSeconds,
        completed: progress.completed,
        completedPercentage: progress.completedPercentage,
        lastWatchedAt: progress.lastWatchedAt,
      },
      courseProgress: courseProgressPercentage,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieve the progress details for all lessons in a course for a student
 */
export const getCourseProgress = async (
  studentId: string,
  courseId: string
): Promise<any> => {
  try {
    const [progresses, totalLessons, lastWatchedRecord] = await Promise.all([
      LessonProgress.find({ student: studentId, course: courseId }),
      Lesson.countDocuments({ course: courseId }),
      RecentlyWatched.findOne({ student: studentId, course: courseId })
        .sort({ watchedAt: -1 })
        .populate("lesson"),
    ]);

    const lessonProgressMap: Record<string, any> = {};
    progresses.forEach((p) => {
      lessonProgressMap[p.lesson.toString()] = {
        watchedSeconds: p.watchedSeconds,
        completed: p.completed,
        completedPercentage: p.completedPercentage,
        lastWatchedAt: p.lastWatchedAt,
      };
    });

    const completedCount = progresses.filter((p) => p.completed).length;
    const courseProgressPercentage = totalLessons > 0 
      ? Math.round((completedCount / totalLessons) * 100) 
      : 0;

    return {
      lessonProgress: lessonProgressMap,
      courseProgress: courseProgressPercentage,
      lastWatched: lastWatchedRecord ? lastWatchedRecord.lesson : null,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieve the top recently watched lessons for a student
 */
export const getRecentlyWatched = async (studentId: string): Promise<any[]> => {
  try {
    const list = await RecentlyWatched.find({ student: studentId })
      .sort({ watchedAt: -1 })
      .limit(5)
      .populate("course", "title slug thumbnailUrl")
      .populate("lesson", "title durationSeconds");

    return list;
  } catch (error) {
    throw error;
  }
};
