// AppRoutes.tsx
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from './routeConfig';
import { withPageData } from '../components/PageWrapper';

// Page imports
import { Home } from '../pages/Home';
import { AllCourses } from '../pages/AllCourses';
import { CourseDetail } from '../pages/CourseDetail';
import { CategoryPage } from '../pages/CategoryPage';
import { Cart } from '../pages/Cart';
import { Wishlist } from '../pages/Wishlist';
import { MyLearning } from '../pages/MyLearning';
import { CoursePlayer } from '../pages/CoursePlayer';
import { Dashboard } from '../components/Dashboard';
import { Login } from '../components/Login';
import { Register } from '../components/Register';

// Wrap pages with HOC to inject common props
const HomePage = withPageData(Home);
const AllCoursesPage = withPageData(AllCourses);
const CourseDetailPage = withPageData(CourseDetail);
const CategoryPageWrapper = withPageData(CategoryPage);
const CartPage = withPageData(Cart);
const WishlistPage = withPageData(Wishlist);
const MyLearningPage = withPageData(MyLearning);
const CoursePlayerPage = withPageData(CoursePlayer);
const DashboardPage = withPageData(Dashboard);

export const appRoutes = [
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.COURSES, element: <AllCoursesPage /> },
      { path: ROUTES.COURSE_DETAIL, element: <CourseDetailPage /> },
      { path: ROUTES.CATEGORY, element: <CategoryPageWrapper /> },
      { path: ROUTES.CART, element: <CartPage /> },
      { path: ROUTES.PLAYLIST, element: <WishlistPage /> },
      {
        path: ROUTES.MY_LEARNING,
        element: <ProtectedRoute><MyLearningPage /></ProtectedRoute>,
      },
      {
        path: ROUTES.COURSE_PLAYER,
        element: <ProtectedRoute><CoursePlayerPage /></ProtectedRoute>,
      },
      {
        path: '/dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
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