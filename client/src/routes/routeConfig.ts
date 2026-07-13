export type RouteNameType =
  | "home"
  | "courses"
  | "courseDetail"
  | "category"
  | "cart"
  | "wishlist"
  | "login"
  | "register"
  | "myLearning"
  | "coursePlayer"
  | "courseCreate" // <-- add this
  | "notFound";
export const ROUTES = {
  HOME: "/",
  COURSES: "/courses",
  COURSE_DETAIL: "/course/:slug",
  CATEGORY: "/category/:slug",
  CART: "/cart",
  Wishlist: "/wishlist",
  LOGIN: "/login",
  REGISTER: "/sign-up",
  MY_LEARNING: "/my-learning",
  COURSE_PLAYER: "/learn/:slug/:lessonId?",
  COURSE_CREATE: "/course/create",
} as const;
export const getCoursePath = (s: string) => `/course/${s}`;
export const getCategoryPath = (s: string) => `/category/${s}`;
export const getCoursePlayerPath = (slug: string, lessonId?: string) =>
  lessonId ? `/learn/${slug}/${lessonId}` : `/learn/${slug}`;
export const isAuthRoute = (pathname: string): boolean =>
  pathname === ROUTES.LOGIN ||
  pathname === ROUTES.REGISTER ||
  pathname === ROUTES.COURSE_CREATE;
export const routeMetadata: Record<
  string,
  { hideHeader?: boolean; hideFooter?: boolean }
> = {
  [ROUTES.LOGIN]: { hideHeader: true, hideFooter: true },
  [ROUTES.REGISTER]: { hideHeader: true, hideFooter: true },
  [ROUTES.COURSE_CREATE]: { hideHeader: true, hideFooter: true },
};
