// AppRoutes.tsx
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { InstructorRoute } from "./InstructorRoute";
import { ROUTES } from "./routeConfig";
import { AllCourses } from "../pages/AllCourses";
import { CourseDetail } from "../pages/CourseDetail";
import { CategoryPage } from "../pages/CategoryPage";
import { Cart } from "../pages/Cart";
import { Wishlist } from "../pages/Wishlist";
import { MyLearning } from "../pages/Mylearing/MyLearning";
import { CoursePlayerPage } from "../pages/Mylearing/CoursePlayer";

import { Login } from "../components/Login";
import { Register } from "../components/Register";
import { CourseTabs } from "../components/CourseTabs";
import HomePage from "../pages/HomePage";
import { Purchases } from "../pages/Purchases";
import ProfilePage from "../pages/Profile/ProfilePage";

// Instructor Layout & Views
import InstructorLayout from "../layouts/InstructorLayout";
import Dashboard from "../pages/instructor/Dashboard";
import MyCourses from "../pages/instructor/MyCourses";
import Students from "../pages/instructor/Students";
import Analytics from "../pages/instructor/Analytics";
import Reviews from "../pages/instructor/Reviews";
import Assignments from "../pages/instructor/Assignments";
import Announcements from "../pages/instructor/Announcements";
import Community from "../pages/instructor/Community";
import Profile from "../pages/instructor/Profile";
import CourseLayout from "../pages/instructor/sections/CourseLayout";
import CourseCreateWizard from "../pages/instructor/courseSteps/Index";

export const appRoutes = [
  // ── Student Site Views (under MainLayout with Header/Footer) ─────────────────
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.COURSES, element: <AllCourses /> },
      { path: ROUTES.COURSE_DETAIL, element: <CourseDetail /> },
      { path: ROUTES.CATEGORY, element: <CategoryPage /> },
      { path: ROUTES.CART, element: <Cart /> },
      { path: ROUTES.Wishlist, element: <Wishlist /> },
      {
        path: ROUTES.MY_LEARNING,
        element: (
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/purchases",
        element: (
          <ProtectedRoute>
            <Purchases />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ── Standalone Course Creation Wizard (completely distraction-free) ───────────
  {
    path: ROUTES.COURSE_CREATE,
    element: (
      <InstructorRoute>
        <CourseCreateWizard />
      </InstructorRoute>
    ),
  },

  // ── Standalone Course Player (completely distraction-free, no global Header/Footer) ───
  {
    path: ROUTES.COURSE_PLAYER,
    element: (
      <ProtectedRoute>
        <CoursePlayerPage />
      </ProtectedRoute>
    ),
  },

  // ── Standalone Course Editor Sidebar Workspace ─────────────────────────────
  {
    path: "/instructor/course/:id/manage",
    element: (
      <InstructorRoute>
        <CourseLayout />
      </InstructorRoute>
    ),
  },

  // ── Instructor Portal Views (under InstructorLayout with Sidebar) ──────────────
  {
    element: (
      <InstructorRoute>
        <InstructorLayout />
      </InstructorRoute>
    ),
    children: [
      {
        path: "/instructor",
        element: <Dashboard />,
      },
      {
        path: "/instructor/courses",
        element: <MyCourses />,
      },
      {
        path: "/instructor/students",
        element: <Students />,
      },
      {
        path: "/instructor/analytics",
        element: <Analytics />,
      },
      {
        path: "/instructor/reviews",
        element: <Reviews />,
      },
    ],
  },

  // ── Auth Views ───────────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.REGISTER, element: <Register /> },
    ],
  },
];
