import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { Home } from './pages/Home';
import { AllCourses } from './pages/AllCourses';
import { CourseDetail } from './pages/CourseDetail';
import { CategoryPage } from './pages/CategoryPage';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { MyLearning } from './pages/MyLearning';
import { CoursePlayer } from './pages/CoursePlayer';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { UserProvider, useUser } from './context/UserContext';
import { isAuthRoute, ROUTES } from './routes/routeConfig';

import './App.css';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const [cart, setCart] = useState<string[]>(() => {
    const saved = localStorage.getItem('kvault_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('kvault_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem('kvault_enrolled');
    return saved ? JSON.parse(saved) : [];
  });

  const [courseProgress, setCourseProgress] = useState<Record<string, {
    progress: number;
    lastAccessed: string;
    completedLessons: string[];
  }>>(() => {
    const saved = localStorage.getItem('kvault_progress');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('kvault_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kvault_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('kvault_enrolled', JSON.stringify(enrolledCourses));
  }, [enrolledCourses]);

  useEffect(() => {
    localStorage.setItem('kvault_progress', JSON.stringify(courseProgress));
  }, [courseProgress]);

  const handleToggleCart = (courseId: string) => {
    setCart(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleToggleWishlist = (courseId: string) => {
    setWishlist(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleUpdateProgress = (
    courseId: string,
    progressVal: number,
    lastAccessed: string,
    completedLessons: string[]
  ) => {
    setCourseProgress(prev => ({
      ...prev,
      [courseId]: {
        progress: progressVal,
        lastAccessed,
        completedLessons
      }
    }));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePurchaseSuccess = (courseIds: string[]) => {
    setEnrolledCourses(prev => [...prev, ...courseIds]);
    setCart([]);
  };

  const showHeader = !isAuthRoute(location.pathname);
  const showFooter = !isAuthRoute(location.pathname);

  return (
    <div className="min-h-screen bg-premium-mesh selection:bg-brand-purple/20 selection:text-brand-purple flex flex-col justify-between">
      {showHeader && (
        <Header
          cartCount={cart.length}
          wishlistCount={wishlist.length}
        />
      )}

      <div className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path={ROUTES.HOME}
              element={
                <Home
                  cart={cart}
                  wishlist={wishlist}
                  enrolledCourses={enrolledCourses}
                  courseProgress={courseProgress}
                  onToggleCart={handleToggleCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              }
            />

            <Route
              path={ROUTES.COURSES}
              element={
                <AllCourses
                  cart={cart}
                  wishlist={wishlist}
                  onToggleCart={handleToggleCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              }
            />

            <Route
              path="/course/:slug"
              element={
                <CourseDetail
                  cart={cart}
                  wishlist={wishlist}
                  onToggleCart={handleToggleCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              }
            />

            <Route
              path="/category/:slug"
              element={
                <CategoryPage
                  cart={cart}
                  wishlist={wishlist}
                  onToggleCart={handleToggleCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              }
            />

            <Route
              path={ROUTES.CART}
              element={
                <Cart
                  cart={cart}
                  wishlist={wishlist}
                  onToggleCart={handleToggleCart}
                  onToggleWishlist={handleToggleWishlist}
                  onClearCart={handleClearCart}
                  onPurchaseSuccess={handlePurchaseSuccess}
                />
              }
            />

            <Route
              path={ROUTES.PLAYLIST}
              element={
                <Wishlist
                  cart={cart}
                  wishlist={wishlist}
                  onToggleCart={handleToggleCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              }
            />

            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    user={user ? { name: user.name, email: user.email } : { name: '', email: '' }}
                    onLogout={logout}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onNavigateLanding={() => navigate('/')}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.MY_LEARNING}
              element={
                <ProtectedRoute>
                  <MyLearning
                    enrolledCourses={enrolledCourses}
                    courseProgress={courseProgress}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/learn/:slug"
              element={
                <ProtectedRoute>
                  <CoursePlayer
                    courseProgress={courseProgress}
                    onUpdateProgress={handleUpdateProgress}
                  />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </AnimatePresence>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
