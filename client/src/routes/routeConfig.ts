export type RouteNameType =
  | 'home'
  | 'courses'
  | 'courseDetail'
  | 'category'
  | 'cart'
  | 'playlist'
  | 'login'
  | 'register'
  | 'emailVerification'
  | 'myLearning'
  | 'coursePlayer'
  | 'notFound';

export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: '/course/:slug',
  CATEGORY: '/category/:slug',
  CART: '/cart',
  PLAYLIST: '/playlist',
  LOGIN: '/login',
  REGISTER: '/sign-up',
  EMAIL_VERIFICATION: '/verify-email',
  MY_LEARNING: '/my-learning',
  COURSE_PLAYER: '/learn/:slug',
} as const;

export const getCoursePath = (slug: string) => `/course/${slug}`;
export const getCategoryPath = (slug: string) => `/category/${slug}`;
export const getCoursePlayerPath = (slug: string) => `/learn/${slug}`;

export const isAuthRoute = (pathname: string): boolean => {
  return (
    pathname === ROUTES.LOGIN ||
    pathname === ROUTES.REGISTER ||
    pathname === ROUTES.EMAIL_VERIFICATION
  );
};

export const routeMetadata: Record<string, { hideHeader?: boolean; hideFooter?: boolean }> = {
  [ROUTES.LOGIN]: { hideHeader: true, hideFooter: true },
  [ROUTES.REGISTER]: { hideHeader: true, hideFooter: true },
  [ROUTES.EMAIL_VERIFICATION]: { hideHeader: true, hideFooter: true },
};
