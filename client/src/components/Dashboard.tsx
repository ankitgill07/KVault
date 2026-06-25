import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Award,
  MessageSquare,
  Settings,
  LogOut,
  Hexagon,
  Sparkles,
  Clock,
  ChevronRight,
  PlayCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { Course } from "../data/courses";
import { COURSES } from "../data/courses";

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onNavigateLanding: () => void;
}

type TabType =
  | "dashboard"
  | "my-courses"
  | "wishlist"
  | "certificates"
  | "messages"
  | "settings";

interface ChatMessage {
  sender: "user" | "mentor";
  text: string;
  time: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  wishlist,
  onToggleWishlist,
  onNavigateLanding,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Track course enrollment state locally in state
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>(() => {
    return COURSES.filter((c) => c.progress !== undefined);
  });

  // Track active course being studied
  const [activeCourse, setActiveCourse] = useState<Course | null>(
    enrolledCourses[0] || null,
  );

  // Chat message state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "mentor",
      text: `Hello ${user.name}! I'm your AI Study Mentor. How can I assist you with your learning goals today?`,
      time: "10:02 AM",
    },
    {
      sender: "mentor",
      text: "Tip: I can provide explanations, debug code snippets, or draft custom roadmaps.",
      time: "10:03 AM",
    },
  ]);
  const [typedMessage, setTypedMessage] = useState("");

  // Handle checking/unchecking a lesson to update progress dynamically
  const handleToggleLesson = (
    courseId: string,
    chapterId: string,
    lessonId: string,
  ) => {
    setEnrolledCourses((prev) => {
      const updated = prev.map((course) => {
        if (course.id !== courseId) return course;

        // Clone chapters and update the target lesson
        const updatedChapters = course.chapters.map((chapter) => {
          if (chapter.id !== chapterId) return chapter;
          const updatedLessons = chapter.lessons.map((lesson) => {
            if (lesson.id !== lessonId) return lesson;
            return { ...lesson, completed: !lesson.completed };
          });
          return { ...chapter, lessons: updatedLessons };
        });

        // Recompute progress percentage
        const totalLessons = updatedChapters.reduce(
          (acc, curr) => acc + curr.lessons.length,
          0,
        );
        const completedLessons = updatedChapters.reduce(
          (acc, curr) => acc + curr.lessons.filter((l) => l.completed).length,
          0,
        );
        const progressPercent = Math.round(
          (completedLessons / totalLessons) * 100,
        );

        // Find last accessed
        const lastCompleted = updatedChapters
          .flatMap((ch) => ch.lessons)
          .filter((l) => l.completed)
          .pop();
        const lastAccessed = lastCompleted
          ? lastCompleted.title
          : "Introductory Lesson";

        const updatedCourse = {
          ...course,
          chapters: updatedChapters,
          progress: progressPercent,
          lastAccessed,
        };

        // If this is the active course, sync it
        if (activeCourse && activeCourse.id === courseId) {
          // Defer update to avoid rendering state cycles
          setTimeout(() => setActiveCourse(updatedCourse), 0);
        }

        return updatedCourse;
      });
      return updated;
    });
  };

  // Mock AI Mentor chat reply trigger
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: typedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const question = typedMessage.toLowerCase();
    setTypedMessage("");

    // Generate responsive response after short delay
    setTimeout(() => {
      let responseText =
        "That's an interesting question! I recommend looking at Chapter 1 of your active course for guidelines, or checking official specifications.";

      if (question.includes("zustand") || question.includes("state")) {
        responseText =
          "When using Zustand, remember to always bind your state hook with specialized selectors. For example: `const count = useStore(state => state.count)`. This avoids re-rendering the component when unrelated fields change.";
      } else if (question.includes("react") || question.includes("hooks")) {
        responseText =
          "React Hooks rely on call-order. Ensure they aren't placed inside conditional checks or loops. If you need dynamic hook computations, look into custom hooks that return computed states.";
      } else if (question.includes("stripe") || question.includes("billing")) {
        responseText =
          "For Stripe integrations, database idempotency is your shield. Create a ledger table referencing stripe invoice IDs and check for existence before initiating credit deliveries.";
      } else if (
        question.includes("design") ||
        question.includes("aesthetics")
      ) {
        responseText =
          "Premium design is about visual hierarchy and air. Stick to a clean 8px layout grid, make line heights comfortable (1.5x font size), and use borders of light alpha-blended opacity (e.g. 10% black/white).";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: responseText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  const resumeCourse = (course: Course) => {
    setActiveCourse(course);
    setActiveTab("my-courses");
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col md:flex-row w-full">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-brand-border/60 flex flex-col justify-between shrink-0 p-6">
        <div className="space-y-8">
          {/* Logo */}
          <div
            onClick={onNavigateLanding}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white premium-shadow">
              <Hexagon className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-brand-navy">
              KVault
            </span>
            <span className="text-[9px] font-black uppercase bg-brand-purple/10 text-brand-purple px-1.5 py-0.5 rounded-full ml-1">
              PRO
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "my-courses", label: "My Learning", icon: BookOpen },
              {
                id: "wishlist",
                label: "Wishlist",
                icon: Heart,
                badge: wishlist.length > 0 ? wishlist.length : undefined,
              },
              { id: "certificates", label: "Certificates", icon: Award },
              { id: "messages", label: "AI Mentor Chat", icon: MessageSquare },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-section text-brand-purple border-l-4 border-brand-purple"
                      : "text-brand-gray hover:text-brand-navy hover:bg-bg-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-brand-purple" : "text-brand-gray"}`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-brand-purple text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="pt-6 border-t border-brand-border/60 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
              alt="avatar"
              className="w-9 h-9 rounded-full bg-brand-purple/10 border border-brand-purple/20 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-navy truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-brand-gray truncate font-medium">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8 overflow-y-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-brand-navy">
                Welcome Back, {user.name}
              </h1>
              <Sparkles className="w-5 h-5 text-brand-gold animate-bounce" />
            </div>
            <p className="text-xs font-bold text-brand-gray mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-brand-border rounded-2xl premium-shadow">
            <Clock className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-bold text-brand-navy">
              Weekly Goal Status: <span className="text-brand-purple">82%</span>
            </span>
          </div>
        </div>

        {/* Tab content router */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Analytics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Active Courses",
                  value: enrolledCourses.length,
                  desc: "In progress",
                  color: "border-brand-purple",
                },
                {
                  label: "Weekly Progress",
                  value: "82%",
                  desc: "+15% from last week",
                  color: "border-brand-blue",
                },
                {
                  label: "Learning Hours",
                  value: "14.5 hrs",
                  desc: "Active session active",
                  color: "border-brand-gold",
                },
                {
                  label: "Certificates",
                  value: "2 Secured",
                  desc: "Verifiable online",
                  color: "border-brand-success",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-[24px] p-5 border border-brand-border premium-shadow border-l-4 ${stat.color} space-y-2`}
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider text-brand-gray">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-brand-navy">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-brand-gray font-semibold">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Resume Learning Column */}
            <div className="bg-white rounded-[32px] p-6 border border-brand-border premium-shadow space-y-6">
              <h2 className="text-lg font-extrabold text-brand-navy">
                Resume Your Active Track
              </h2>

              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg-secondary rounded-2xl gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: course.gradient }}
                      >
                        {course.skills[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-brand-navy leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-xs text-brand-gray font-semibold mt-0.5">
                          Last module: {course.lastAccessed}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-xs font-bold text-brand-navy">
                          {course.progress}% Completed
                        </span>
                        <div className="w-24 h-1.5 bg-brand-border rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-brand-purple rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <button
                        onClick={() => resumeCourse(course)}
                        className="px-4 py-2 bg-brand-navy hover:bg-brand-purple text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Open Syllabus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations & schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming schedule */}
              <div className="bg-white rounded-[32px] p-6 border border-brand-border premium-shadow space-y-4">
                <h3 className="text-sm font-extrabold text-brand-navy">
                  Upcoming Syllabus Milestones
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-bg-secondary/40 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-brand-navy">
                        State Orchestration with Zustand
                      </p>
                      <p className="text-[10px] text-brand-gray mt-0.5">
                        Advanced React Architecture • Sarah Jenkins
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-bg-secondary/40 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-brand-navy">
                        Double-entry Billing models
                      </p>
                      <p className="text-[10px] text-brand-gray mt-0.5">
                        Stripe Integration & Systems • Marc Veras
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Specialties */}
              <div className="bg-white rounded-[32px] p-6 border border-brand-border premium-shadow space-y-4">
                <h3 className="text-sm font-extrabold text-brand-navy">
                  AI Model Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="p-3 border border-brand-border/60 hover:border-brand-purple/20 rounded-2xl flex justify-between items-center transition-colors">
                    <div>
                      <p className="text-xs font-extrabold text-brand-navy">
                        Visual Design: Apple-Level Aesthetics
                      </p>
                      <p className="text-[10px] text-brand-gray mt-0.5">
                        Complement your engineering capabilities
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-gray" />
                  </div>
                  <div className="p-3 border border-brand-border/60 hover:border-brand-purple/20 rounded-2xl flex justify-between items-center transition-colors">
                    <div>
                      <p className="text-xs font-extrabold text-brand-navy">
                        AI Engineering & Vector Datasets
                      </p>
                      <p className="text-[10px] text-brand-gray mt-0.5">
                        Integrate LLM pipelines into current React structures
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-gray" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: My Courses */}
        {activeTab === "my-courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left list of enrolled courses */}
            <div className="lg:col-span-4 space-y-4 w-full">
              <h2 className="text-sm font-extrabold text-brand-navy">
                Enrolled Tracks
              </h2>
              {enrolledCourses.map((course) => {
                const isActive = activeCourse?.id === course.id;
                return (
                  <div
                    key={course.id}
                    onClick={() => setActiveCourse(course)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-white border-brand-purple premium-shadow"
                        : "bg-white/60 border-brand-border hover:bg-white"
                    }`}
                  >
                    <h3 className="text-xs font-bold text-brand-navy leading-snug">
                      {course.title}
                    </h3>
                    <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-brand-gray">
                      <span>{course.progress}% complete</span>
                      <span>{course.chapters.length} Modules</span>
                    </div>
                    <div className="w-full h-1 bg-bg-secondary rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-brand-purple rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Course Syllabus Explorer */}
            {activeCourse ? (
              <div className="lg:col-span-8 bg-white rounded-[32px] p-6 border border-brand-border premium-shadow space-y-6 w-full">
                <div className="flex justify-between items-start gap-4 pb-4 border-b border-brand-border/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                      {activeCourse.category}
                    </span>
                    <h2 className="text-xl font-extrabold text-brand-navy mt-0.5">
                      {activeCourse.title}
                    </h2>
                    <p className="text-xs font-semibold text-brand-gray mt-1">
                      Instructor: {activeCourse.instructor} •{" "}
                      {activeCourse.instructorRole}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-extrabold text-brand-purple">
                      {activeCourse.progress}% Completed
                    </span>
                    <p className="text-[9px] text-brand-gray mt-0.5">
                      Click checks to progress
                    </p>
                  </div>
                </div>

                {/* Syllabus Modules checklist */}
                <div className="space-y-6">
                  {activeCourse.chapters.map((chapter) => (
                    <div key={chapter.id} className="space-y-3">
                      <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider bg-bg-secondary px-3 py-1.5 rounded-xl">
                        {chapter.title}
                      </h3>

                      <div className="space-y-1">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-bg-primary/50 transition-colors"
                          >
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!lesson.completed}
                                onChange={() =>
                                  handleToggleLesson(
                                    activeCourse.id,
                                    chapter.id,
                                    lesson.id,
                                  )
                                }
                                className="w-4.5 h-4.5 rounded-md border-brand-border text-brand-purple focus:ring-brand-purple cursor-pointer"
                              />
                              <span
                                className={`text-xs font-semibold transition-all ${
                                  lesson.completed
                                    ? "line-through text-brand-gray"
                                    : "text-brand-navy"
                                }`}
                              >
                                {lesson.title}
                              </span>
                            </label>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-brand-gray">
                                {lesson.duration}
                              </span>
                              <PlayCircle className="w-4 h-4 text-brand-purple" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="lg:col-span-8 bg-white rounded-[32px] p-12 text-center border border-brand-border premium-shadow w-full">
                <BookOpen className="w-12 h-12 text-brand-gray mx-auto mb-4" />
                <h3 className="font-extrabold text-sm text-brand-navy">
                  No Course Selected
                </h3>
                <p className="text-xs text-brand-gray mt-1">
                  Select an active enrollment on the left to begin learning.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Wishlist */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-brand-navy">
              My Wishlist
            </h2>

            {wishlist.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border border-brand-border premium-shadow">
                <Heart className="w-12 h-12 text-brand-gray mx-auto mb-4" />
                <h3 className="font-extrabold text-sm text-brand-navy">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-brand-gray mt-1">
                  Courses you bookmark on the landing page will show up here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {COURSES.filter((c) => wishlist.includes(c.id)).map(
                  (course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-3xl border border-brand-border premium-shadow p-5 flex flex-col justify-between h-48"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] uppercase font-bold text-brand-purple bg-brand-purple/5 px-2 py-0.5 rounded">
                            {course.category}
                          </span>
                          <button
                            onClick={() => onToggleWishlist(course.id)}
                            className="text-red-500 hover:text-brand-gray transition-colors"
                          >
                            <Heart className="w-4 h-4 fill-red-500" />
                          </button>
                        </div>
                        <h3 className="font-extrabold text-sm text-brand-navy mt-2 leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-xs text-brand-gray mt-1">
                          by {course.instructor}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-border/40">
                        <span className="text-base font-black text-brand-navy">
                          ${course.price}
                        </span>
                        <button
                          onClick={() => {
                            setEnrolledCourses((prev) => {
                              if (prev.some((c) => c.id === course.id))
                                return prev;
                              const newEnroll = {
                                ...course,
                                progress: 0,
                                lastAccessed: "Chapter 1 Overview",
                              };
                              return [...prev, newEnroll];
                            });
                            onToggleWishlist(course.id);
                            setActiveTab("my-courses");
                          }}
                          className="px-4 py-2 bg-brand-purple hover:bg-brand-blue text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Certificates */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <h2 className="text-lg font-extrabold text-brand-navy">
              Earned Credentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Advanced React Architecture",
                  date: "June 10, 2026",
                  id: "KV-REC-984",
                  status: "Secured",
                },
                {
                  title: "System Scaling & Ledgers",
                  date: "May 24, 2026",
                  id: "KV-SYS-872",
                  status: "Secured",
                },
              ].map((cert, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-brand-border premium-shadow p-6 relative overflow-hidden flex flex-col justify-between h-52"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-purple/5 to-transparent rounded-bl-full"></div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-brand-success">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-xs font-extrabold uppercase tracking-wide">
                        Verifiable Certificate
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-brand-navy leading-snug">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-brand-gray font-semibold">
                      Awarded to:{" "}
                      <span className="text-brand-navy">{user.name}</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between text-[11px] font-bold text-brand-gray">
                    <div>
                      <p>Date: {cert.date}</p>
                      <p className="font-mono text-[9px] mt-0.5">
                        Hash: {cert.id}
                      </p>
                    </div>
                    <span className="bg-brand-success/15 text-brand-success px-2.5 py-1 rounded-xl">
                      {cert.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Messages */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-[32px] border border-brand-border premium-shadow overflow-hidden flex flex-col h-[550px]">
            {/* Chat header */}
            <div className="p-4 border-b border-brand-border/60 bg-bg-secondary/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-purple text-white flex items-center justify-center font-bold text-sm">
                  AI
                </div>
                <div>
                  <h3 className="text-xs font-bold text-brand-navy">
                    KVault Interactive Mentor
                  </h3>
                  <p className="text-[10px] text-brand-success font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-ping"></span>
                    Online • Specialized in React & SaaS Architecture
                  </p>
                </div>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-bg-primary/30">
              {chatMessages.map((msg, idx) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md rounded-2xl p-3.5 text-xs ${
                        isUser
                          ? "bg-brand-purple text-white rounded-tr-none"
                          : "bg-white border border-brand-border/60 text-brand-navy rounded-tl-none premium-shadow"
                      }`}
                    >
                      <p className="font-semibold leading-relaxed">
                        {msg.text}
                      </p>
                      <span
                        className={`block text-[9px] mt-1.5 text-right ${isUser ? "text-white/60" : "text-brand-gray"}`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-brand-border/60 shrink-0 bg-white flex gap-3"
            >
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Ask about Zustand patterns, billing idempotency, or styling systems..."
                className="flex-1 px-4 py-3 bg-bg-secondary border border-transparent rounded-2xl text-xs font-semibold focus:bg-white focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-brand-purple hover:bg-brand-blue text-white rounded-2xl transition-colors cursor-pointer flex items-center justify-center shrink-0 animate-pulse"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-[32px] p-6 border border-brand-border premium-shadow space-y-6">
            <h2 className="text-lg font-extrabold text-brand-navy">
              SaaS Settings
            </h2>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-4 py-2.5 border border-brand-border rounded-[20px] text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-navy">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-brand-border bg-bg-secondary rounded-[20px] text-xs font-semibold text-brand-gray"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/40 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-brand-border rounded-xl text-xs font-bold text-brand-navy hover:bg-bg-secondary transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() =>
                    alert("Profile settings successfully updated!")
                  }
                  className="px-4 py-2 bg-brand-purple hover:bg-brand-blue text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
