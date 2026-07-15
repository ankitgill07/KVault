import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ShieldCheck } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchMyEnrollments,
  selectEnrollments,
} from "../../store/enrollmentSlice";
import useAllCourses from "../../hooks/useAllCourses";
import { enrollmentService } from "../../services/enrollmentService";
import {
  fetchCourseProgress,
  fetchRecentlyWatched,
} from "../../store/progressSlice";
import { Certificates } from "./Certificates";
import { ContinueLearning, type CourseProgressInfo } from "./ContinueLearning";
import { jsPDF } from "jspdf";


export const MyLearning = () => {
  const dispatch = useAppDispatch();
  const { courses, loading: coursesLoading } = useAllCourses();
  const enrollments = useAppSelector(selectEnrollments);
  const courseProgresses = useAppSelector(
    (state) => state.progress.courseProgresses,
  );
  const recentlyWatched = useAppSelector(
    (state) => state.progress.recentlyWatched,
  );
  const lastWatchedByCourseId = useAppSelector(
    (state) => state.progress.lastWatched,
  );
  const completedLessonsList = useAppSelector(
    (state) => state.progress.completedLessonsList,
  );
  const [downloadingCertificate, setDownloadingCertificate] = useState<
    string | null
  >(null);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
    dispatch(fetchRecentlyWatched());
  }, [dispatch]);

  useEffect(() => {
    enrollments.forEach((enrollment) => {
      const courseId =
        typeof enrollment.course === "string"
          ? enrollment.course
          : enrollment.course?._id;

      if (courseId) {
        dispatch(fetchCourseProgress(courseId));
      }
    });
  }, [dispatch, enrollments]);

  const enrolledCourseIds = useMemo(
    () =>
      enrollments
        .map((enrollment) =>
          typeof enrollment.course === "string"
            ? enrollment.course
            : enrollment.course?._id,
        )
        .filter(Boolean) as string[],
    [enrollments],
  );

  const activeEnrolls = useMemo(
    () => courses.filter((course) => enrolledCourseIds.includes(course._id)),
    [courses, enrolledCourseIds],
  );

  const progressByCourseId = useMemo(() => {
    const progressMap: Record<string, CourseProgressInfo> = {};

    enrollments.forEach((enrollment) => {
      const courseId =
        typeof enrollment.course === "string"
          ? enrollment.course
          : enrollment.course?._id;

      if (!courseId) return;

      progressMap[courseId] = {
        progress: courseProgresses[courseId] ?? enrollment.progress ?? 0,
        lastAccessed: enrollment.lastAccessed || "Not started yet",
        completedLessons:
          completedLessonsList[courseId] || enrollment.completedLessons || [],
      };
    });

    return progressMap;
  }, [completedLessonsList, courseProgresses, enrollments]);

  const fallbackRecent = useMemo(() => {
    return activeEnrolls
      .filter(
        (course) =>
          progressByCourseId[course._id]?.lastAccessed &&
          progressByCourseId[course._id].lastAccessed !== "Not started yet",
      )
      .sort(
        (a, b) =>
          (progressByCourseId[b._id]?.progress || 0) -
          (progressByCourseId[a._id]?.progress || 0),
      )[0];
  }, [activeEnrolls, progressByCourseId]);



  const completedCourses = useMemo(
    () =>
      activeEnrolls.filter(
        (course) => (progressByCourseId[course._id]?.progress || 0) === 100,
      ),
    [activeEnrolls, progressByCourseId],
  );

  const handleDownloadCertificate = async (
    courseId: string,
    courseTitle: string,
  ) => {
    try {
      setDownloadingCertificate(courseId);
      const result = await enrollmentService.generateCertificate({ courseId });

      if (result && "certificateUrl" in result && result.certificateUrl) {
        const studentName =
          "student" in result ? result.student?.name || "Student" : "Student";
        const courseName =
          "course" in result
            ? result.course?.title || courseTitle
            : courseTitle;
        const completedDate =
          "completedAt" in result && result.completedAt
            ? new Date(result.completedAt).toLocaleDateString()
            : new Date().toLocaleDateString();
        const certId =
          "certificateId" in result ? result.certificateId || "N/A" : "N/A";

        // Generate beautiful landscape PDF certificate using jsPDF
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        // A4 dimension: 297mm x 210mm
        // Draw deep navy frame border
        doc.setDrawColor(24, 24, 37);
        doc.setLineWidth(1.5);
        doc.rect(10, 10, 277, 190);

        // Draw accent violet inner frame border
        doc.setDrawColor(124, 58, 237);
        doc.setLineWidth(0.5);
        doc.rect(12, 12, 273, 186);

        // Title header
        doc.setTextColor(24, 24, 37);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(28);
        doc.text("CERTIFICATE OF COMPLETION", 148.5, 45, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text("This is proudly presented to", 148.5, 65, { align: "center" });

        // Student name
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(124, 58, 237);
        doc.text(studentName, 148.5, 80, { align: "center" });

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text("for successfully completing the online specialization course", 148.5, 95, { align: "center" });

        // Course title
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(24, 24, 37);
        doc.text(`"${courseName}"`, 148.5, 110, { align: "center" });

        // Platform metadata
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`Completion Date: ${completedDate}`, 40, 145);
        doc.text(`Certificate ID: ${certId}`, 40, 153);
        doc.text("KVault LMS Academy Verification Link: https://kvault.com/verify", 40, 161);

        // Instructor signature lines
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(24, 24, 37);
        
        const instName = "course" in result && (result.course as any)?.primaryInstructor?.name
          ? (result.course as any).primaryInstructor.name
          : "Course Instructor";
          
        doc.text(instName, 220, 145, { align: "center" });
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.5);
        doc.line(190, 148, 250, 148);
        
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("Authorized Instructor Signature", 220, 153, { align: "center" });

        // Download directly to PDF
        doc.save(`certificate-${courseTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`);

        alert(`Certificate downloaded successfully for "${courseTitle}"`);
      } else if (result && "alreadyIssued" in result) {
        alert(`Certificate already issued for "${courseTitle}".`);
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloadingCertificate(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">
          My Learning Portal
        </h1>
        <p className="text-xs text-brand-gray font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Securely Synced with KVault Backend API
        </p>
      </div>

      {activeEnrolls.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 gap-8 items-start my-10">
            <div className="lg:col-span-2 space-y-10">
              <ContinueLearning
                courses={activeEnrolls}
                progressByCourseId={progressByCourseId}
                lastWatchedByCourseId={lastWatchedByCourseId}
                loading={coursesLoading}
              />
            </div>
          </div>
          <section>
            <Certificates
              courses={completedCourses}
              downloadingCourseId={downloadingCertificate}
              onDownload={handleDownloadCertificate}
            />
          </section>
        </div>
      ) : (
        <div className="text-center py-20 bg-bg-card border border-brand-border rounded-[32px] premium-shadow max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto text-brand-purple">
            <BookOpen className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-brand-navy">
              Your learning queue is empty
            </h2>
            <p className="text-xs text-brand-gray font-semibold max-w-xs mx-auto leading-relaxed">
              Unlock practical courses and curriculum structures. Check out
              courses in the catalog.
            </p>
          </div>

          <Link
            to="/courses"
            className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-bold rounded-2xl inline-block premium-shadow"
          >
            Explore Catalog
          </Link>
        </div>
      )}
    </div>
  );
};
