import React from "react";
import CourseCard from "./CourseCard";
import type { Course } from "../api/courseApi";

interface CourseSectionProps {
  title: string;
  courses: Course[];
}

function CourseSection({ title, courses }: CourseSectionProps) {
  return (
    <div>
      {" "}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-brand-navy">{title}</h2>
            <p className="text-brand-gray text-sm mt-1">
              Explore our hand-picked courses
            </p>
          </div>

          <button className="text-brand-purple font-bold hover:underline">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.slice(0, 6).map((course: Course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseSection;
