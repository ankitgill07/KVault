import React, { createContext, useContext, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useUser } from './UserContext';

interface AppStateContextType {
  // App state
  cart: string[];
  wishlist: string[];
  enrolledCourses: string[];
  courseProgress: Record<string, any>;
  toggleCart: (courseId: string) => void;
  toggleWishlist: (courseId: string) => void;
  addToEnrolled: (courseIds: string[]) => void;
  updateCourseProgress: (courseId: string, progress: number, lastAccessed: string, completedLessons: string[]) => void;
  clearCart: () => void;
  
  // Cart state
  cartItems: any;
  cartLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (courseId: string, priceAtAdd?: number) => Promise<boolean>;
  removeFromCart: (courseId: string) => Promise<void>;
  isInCart: (courseId: string) => boolean;
  cartCount: number;
  
  // Wishlist state
  wishlistItems: any;
  wishlistLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (courseId: string) => Promise<boolean>;
  removeFromWishlist: (courseId: string) => Promise<void>;
  isInWishlist: (courseId: string) => boolean;
  wishlistCount: number;
  
  // User state
  user: any;
  isSignedIn: boolean;
  userLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appState = useAppState();
  const cart = useCart();
  const wishlist = useWishlist();
  const user = useUser();

  const value = useMemo(() => ({
    // App state
    cart: appState.state.cart,
    wishlist: appState.state.wishlist,
    enrolledCourses: appState.state.enrolledCourses,
    courseProgress: appState.state.courseProgress,
    toggleCart: appState.toggleCart,
    toggleWishlist: appState.toggleWishlist,
    addToEnrolled: appState.addToEnrolled,
    updateCourseProgress: appState.updateCourseProgress,
    clearCart: appState.clearCart,
    
    // Cart state
    cartItems: cart.cart,
    cartLoading: cart.loading,
    fetchCart: cart.fetchCart,
    addToCart: cart.addToCart,
    removeFromCart: cart.removeFromCart,
    isInCart: cart.isInCart,
    cartCount: cart.cartCount,
    
    // Wishlist state
    wishlistItems: wishlist.wishlist,
    wishlistLoading: wishlist.loading,
    fetchWishlist: wishlist.fetchWishlist,
    addToWishlist: wishlist.addToWishlist,
    removeFromWishlist: wishlist.removeFromWishlist,
    isInWishlist: wishlist.isInWishlist,
    wishlistCount: wishlist.wishlistCount,
    
    // User state
    user: user.user,
    isSignedIn: user.isSignedIn,
    userLoading: user.loading,
    login: user.login,
    register: user.register,
    logout: user.logout,
  }), [appState, cart, wishlist, user]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within AppStateProvider');
  }
  return context;
};