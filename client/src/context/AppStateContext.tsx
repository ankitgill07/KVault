import React, { createContext, useContext, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';

import { useUser } from './UserContext';

interface AppStateContextType {

  
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
    

    
    // User state
    user: user.user,
    isSignedIn: user.isSignedIn,
    userLoading: user.loading,
    login: user.login,
    register: user.register,
    logout: user.logout,
  }), [appState, , user]);

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