import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play,
  Award,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Clock,
  Flame,
  ShieldCheck,
  Download,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchMyEnrollments,
  selectEnrollments,
} from "../store/enrollmentSlice";
import useAllCourses from "../hooks/useAllCourses";
import { enrollmentService } from "../services/enrollmentService";

export const MyLearning = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { courses } = useAllCourses();

  // Redux state
  const enrollments = useAppSelector(selectEnrollments);
  const [downloadingCertificate, setDownloadingCertificate] = useState<string | null>(null);

  // Fetch enrollments on mount
  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  const enrolledCourseIds = enrollments.map((e) => e.course._id);
  console.log(enrolledCourseIds);
  const activeEnrolls = courses.filter((course) =>
    enrolledCourseIds.includes(course._id),
  );
  console.log(activeEnrolls);

  // Create a map of course progress from enrollments
  const courseProgressMap: Record<
    string,
    {
      progress: number;
      lastAccessed: string;
      completedLessons: string[];
    }
  > = {};

  enrollments.forEach((enrollment) => {
    courseProgressMap[enrollment.course._id] = {
      progress: enrollment.progress,
      lastAccessed: enrollment.lastAccessed || "Not started yet",
      completedLessons: enrollment.completedLessons || [],
    };
  });

  // Determine recently watched (the one with highest progress or non-empty lastAccessed)
  const recentlyWatched = activeEnrolls
    .filter(
      (c) =>
        courseProgressMap[c._id]?.lastAccessed &&
        courseProgressMap[c._id].lastAccessed !== "Not started yet",
    )
    .sort((a, b) => {
      const progA = courseProgressMap[a._id]?.progress || 0;
      const progB = courseProgressMap[b._id]?.progress || 0;
      return progB - progA;
    })[0];

  // Recommendations: courses that the user is NOT enrolled in
  const recommendations = courses
    .filter((course) => !enrolledCourseIds.includes(course._id))
    .slice(0, 2);

  const getCompletedLessonsCount = (courseId: string, totalCount: number) => {
    const prog = courseProgressMap[courseId];
    if (!prog) return 0;
    return prog.completedLessons.length;
  };

  const getProgressVal = (courseId: string) => {
    const prog = courseProgressMap[courseId];
    return prog ? prog.progress : 0;
  };

  const getLastAccessed = (courseId: string) => {
    const prog = courseProgressMap[courseId];
    return prog && prog.lastAccessed ? prog.lastAccessed : "Not started yet";
  };

  const handleDownloadCertificate = async (courseId: string, courseTitle: string) => {
    try {
      setDownloadingCertificate(courseId);
      const result = await enrollmentService.generateCertificate({ courseId });
      
      // Check if certificate was successfully generated or already exists
      if (result && 'certificateUrl' in result && result.certificateUrl) {
        // In a real implementation, this would download the PDF
        // For now, we'll create a simple text file with certificate details
        const studentName = 'student' in result ? result.student?.name || 'Student' : 'Student';
        const courseName = 'course' in result ? result.course?.title || courseTitle : courseTitle;
        const completedDate = 'completedAt' in result && result.completedAt ? new Date(result.completedAt).toLocaleDateString() : new Date().toLocaleDateString();
        const certId = 'certificateId' in result ? result.certificateId || 'N/A' : 'N/A';
        
        const certificateText = `
CERTIFICATE OF COMPLETION

This is to certify that

${studentName}

has successfully completed the course

"${courseName}"

Completed on: ${completedDate}
Certificate ID: ${certId}

Issued by KVault LMS Academy
        `;

        const blob = new Blob([certificateText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${courseTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert(`Certificate downloaded successfully for "${courseTitle}"`);
      } else if (result && 'alreadyIssued' in result) {
        alert(`Certificate already issued for "${courseTitle}". Downloading again...`);
        // Handle re-download
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Enrolls & Certificates Left/Center column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Continue Learning list */}
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand-purple" />
                Continue Learning
              </h2>

              <div className="space-y-4">
                {activeEnrolls.map((course) => {
                  const progressVal = getProgressVal(course._id);
                  const isCompleted = progressVal === 100;

                  return (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-brand-border premium-shadow p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-brand-purple/20 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-26 h-26  overflow-hidden shrink-0 relative flex items-center justify-center">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-contain rounded-2xl"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-purple"></span>
                          <h3 className="font-extrabold text-sm text-brand-navy truncate">
                            {course.title}
                          </h3>
                          <p className="text-xs text-brand-gray truncate">
                            Last lesson:{" "}
                            <span className="font-semibold text-brand-navy">
                              {getLastAccessed(course._id)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Progress Metrics & Action */}
                      <div className="flex items-center gap-6 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[10px] font-bold text-brand-navy">
                            <span>
                              {getCompletedLessonsCount(
                                course._id,
                                course.totalLessons,
                              )}
                              /{course.totalLessons} lessons
                            </span>
                            <span>{progressVal}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full"
                              style={{ width: `${progressVal}%` }}
                            ></div>
                          </div>
                        </div>

                        {isCompleted ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-extrabold">
                            <CheckCircle2 className="w-4 h-4" />
                            Done
                          </span>
                        ) : (
                          <Link
                            to={`/learn/${course.slug}`}
                            className="px-4 py-2.5 rounded-2xl bg-brand-navy hover:bg-brand-purple text-white text-xs font-bold transition-all duration-200 premium-shadow flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white text-white" />
                            <span>Resume</span>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Verification Credentials / Certificates */}
            {activeEnrolls.some((c) => getProgressVal(c._id) === 100) && (
              <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-purple" />
                  Earned Certificates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeEnrolls
                    .filter((c) => getProgressVal(c._id) === 100)
                    .map((course) => (
                      <div
                        key={course._id}
                        className="bg-gradient-to-br from-white to-bg-secondary border border-brand-purple/20 rounded-[24px] p-5 premium-shadow flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <Award className="w-8 h-8 text-brand-gold" />
                          <h4 className="font-extrabold text-xs text-brand-navy line-clamp-2 leading-snug">
                            {course.title}
                          </h4>
                          <p className="text-[10px] text-brand-gray font-bold">
                            Issued by KVault LMS Academy
                          </p>
                        </div>

                        <button
                          onClick={() => handleDownloadCertificate(course._id, course.title)}
                          disabled={downloadingCertificate === course._id}
                          className="w-fit px-4 py-2 bg-brand-purple text-white text-[10px] font-bold rounded-xl cursor-pointer hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {downloadingCertificate === course._id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              Download Certificate
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar: Recently accessed & Recommendations */}
          <aside className="w-full space-y-8">
            {/* Recently Accessed Card */}
            {recentlyWatched && (
              <div className="bg-white rounded-[32px] border border-brand-border premium-shadow p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-brand-navy border-b border-brand-border/60 pb-3">
                  Recently Watched
                </h3>

                <div className="space-y-3">
                  <div className="h-28 w-full rounded-2xl flex items-center justify-center text-white font-extrabold text-xs text-center p-4 relative">
                    <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                    <span className="z-10 line-clamp-2 leading-snug">
                      {recentlyWatched.title}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-brand-navy line-clamp-1">
                      {recentlyWatched.title}
                    </p>
                    <p className="text-[10px] text-brand-gray font-medium">
                      Last active lesson:{" "}
                      <span className="text-brand-purple font-semibold">
                        {getLastAccessed(recentlyWatched._id)}
                      </span>
                    </p>
                  </div>

                  <Link
                    to={`/learn/${recentlyWatched.slug}`}
                    className="w-full py-2.5 rounded-xl bg-bg-secondary hover:bg-brand-purple/10 text-brand-navy hover:text-brand-purple text-[10px] font-bold transition-all text-center block"
                  >
                    Open Player
                  </Link>
                </div>
              </div>
            )}

            {/* Recommendations Card */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-[32px] border border-brand-border premium-shadow p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-brand-navy border-b border-brand-border/60 pb-3">
                  Recommended Next
                </h3>

                <div className="space-y-4 divide-y divide-brand-border/60">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={rec._id}
                      className={`space-y-2.5 ${idx > 0 ? "pt-4" : ""}`}
                    >
                      <span className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple rounded-md text-[8px] font-bold uppercase tracking-wider block w-fit">
                        {rec.level}
                      </span>
                      <h4 className="font-extrabold text-xs text-brand-navy line-clamp-2 leading-snug">
                        {rec.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] font-bold text-brand-gray pt-1">
                        <span>By </span>
                        <span className="text-brand-navy font-extrabold">
                          ${rec.price}
                        </span>
                      </div>

                      <Link
                        to={`/course/${rec.slug}`}
                        className="w-full py-2 border border-brand-border rounded-xl text-[10px] font-bold hover:bg-bg-secondary text-brand-navy flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Explore Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-brand-border rounded-[32px] premium-shadow max-w-xl mx-auto space-y-6">
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
