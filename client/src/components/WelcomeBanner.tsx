import React from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Sparkles,
  ArrowRight,
  Compass,
  Gift,
  PartyPopper,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export type WelcomeStatus = "new" | "no-purchases" | "active";

interface WelcomeBannerProps {
  userName?: string;
  /**
   * "new"           — account was just created, hasn't browsed/bought anything
   * "no-purchases"  — returning, logged-in user with zero enrolled courses
   * "active"        — has at least one course in progress
   */
  status?: WelcomeStatus;
  streakDays?: number;
  coursesInProgress?: number;
  onResumeLearning?: () => void;
  onBrowseCourses?: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName = "User",
  status = "no-purchases",
  streakDays = 0,
  coursesInProgress = 0,
  onResumeLearning,
  onBrowseCourses,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const firstName = userName.split(" ")[0];

  // ---- New account: celebratory, onboarding-flavored ----
  if (status === "new") {
    return (
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-purple via-brand-navy to-brand-navy p-8 sm:p-10 mb-10 text-white">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-brand-gold/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-brand-blue/20 rounded-full blur-[90px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-white/5 backdrop-blur rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/10 dark:border-white/5 mb-4">
              <PartyPopper className="w-3.5 h-3.5 text-brand-gold" />
              Account created
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome to the community, {firstName}
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-white/70 dark:text-white/60 max-w-lg">
              You're all set. Tell us a few topics you're into and we'll line
              up your first course — most learners enroll in under 2 minutes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-2xl backdrop-blur">
              <Gift className="w-5 h-5 text-brand-gold" />
              <div className="leading-tight">
                <p className="text-xs font-extrabold text-white">First course 20% off</p>
                <p className="text-[10px] text-white/60 dark:text-white/40 font-semibold">
                  Applied at checkout
                </p>
              </div>
            </div>

            <button
              onClick={onBrowseCourses}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-bg-card text-brand-navy dark:text-white text-xs font-extrabold rounded-2xl hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              Find my first course
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ---- Logged in, no enrollments yet: nudge toward browsing ----
  if (status === "no-purchases") {
    return (
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-brand-navy via-brand-navy to-[#1e1b4b] dark:from-bg-card dark:via-bg-card dark:to-bg-secondary p-8 sm:p-10 mb-10 text-white dark:text-foreground">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-purple/30 dark:bg-brand-purple/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-blue/20 dark:bg-brand-blue/10 rounded-full blur-[90px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-white/5 backdrop-blur rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/10 dark:border-white/5 mb-4">
              <Compass className="w-3.5 h-3.5 text-brand-gold" />
              {getGreeting()}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-white/70 dark:text-white/60 max-w-lg">
              Your learning list is empty so far. Browse trending picks below
              or tell us your goals and we'll narrow it down for you.
            </p>
          </div>

          <button
            onClick={onBrowseCourses}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-bg-card text-brand-navy dark:text-white text-xs font-extrabold rounded-2xl hover:opacity-90 transition-opacity cursor-pointer shrink-0 whitespace-nowrap"
          >
            Browse courses
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    );
  }

  // ---- Active learner: progress-focused ----
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-brand-navy via-brand-navy to-[#1e1b4b] dark:from-bg-card dark:via-bg-card dark:to-bg-secondary p-8 sm:p-10 mb-10 text-white dark:text-foreground">
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-purple/30 dark:bg-brand-purple/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-blue/20 dark:bg-brand-blue/10 rounded-full blur-[90px]"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-white/5 backdrop-blur rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/10 dark:border-white/5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            {getGreeting()}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-white/70 dark:text-white/60 max-w-lg">
            You have {coursesInProgress} course
            {coursesInProgress !== 1 ? "s" : ""} in progress. Pick up right
            where you left off.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {streakDays > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-2xl backdrop-blur">
              <Flame className="w-5 h-5 text-orange-400 fill-orange-400/30" />
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-white dark:text-foreground">{streakDays} day streak</p>
                <p className="text-[10px] text-white/60 dark:text-white/40 font-semibold">
                  Keep it going
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onResumeLearning}
            className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white dark:bg-bg-card text-brand-navy dark:text-white text-xs font-extrabold rounded-2xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Resume Learning
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};