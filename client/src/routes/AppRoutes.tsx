// AppRoutes.tsx
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES } from "./routeConfig";
import { AllCourses } from "../pages/AllCourses";
import { CourseDetail } from "../pages/CourseDetail";
import { CategoryPage } from "../pages/CategoryPage";
import { Cart } from "../pages/Cart";
import { Wishlist } from "../pages/Wishlist";
import { MyLearning } from "../pages/MyLearning";
import { CoursePlayer } from "../pages/CoursePlayer";

import { Login } from "../components/Login";
import { Register } from "../components/Register";
import { CourseTabs } from "../components/CourseTabs";
import { Purchases } from "../pages/Purchases";
import ProfilePage from ".././pages/Profile/ProfilePage";

export const appRoutes = [
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.HOME, element: <CourseTabs /> },
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
        path: ROUTES.COURSE_PLAYER,
        element: (
          <ProtectedRoute>
            <CoursePlayer />
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
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.REGISTER, element: <Register /> },
    ],
  },
];

// ✅ AppRoutes component REMOVED — use createBrowserRouter + RouterProvider instead
