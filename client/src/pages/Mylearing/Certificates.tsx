import { Award, Download } from "lucide-react";
import type { Course } from "../../api/courseApi";

interface CertificatesProps {
  courses: Course[];
  downloadingCourseId: string | null;
  onDownload: (courseId: string, courseTitle: string) => void;
}

export function Certificates({
  courses,
  downloadingCourseId,
  onDownload,
}: CertificatesProps) {
  if (courses.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
        <Award className="w-5 h-5 text-brand-purple" />
        Earned Certificates
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => {
          const isDownloading = downloadingCourseId === course._id;

          return (
            <div
              key={course._id}
              className="bg-gradient-to-br from-bg-card to-bg-secondary border border-brand-purple/20 rounded-[24px] p-5 premium-shadow flex flex-col justify-between gap-4"
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
                onClick={() => onDownload(course._id, course.title)}
                disabled={isDownloading}
                className="w-fit px-4 py-2 bg-brand-purple text-white text-[10px] font-bold rounded-xl cursor-pointer hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDownloading ? (
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
          );
        })}
      </div>
    </section>
  );
}
