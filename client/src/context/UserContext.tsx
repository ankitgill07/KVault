import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

export interface User {
  id?: string;
  name: string;
  email: string;
  location?: string;
}

interface UserContextType {
  user: User | null;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('kvault_access_token');
      if (token) {
        try {
          const response = await authService.getMe();
          if (response.success) {
            const userData = response.data;
            setUser({
              id: userData.id,
              name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
              email: userData.email
            });
            setIsSignedIn(true);
          }
        } catch (err) {
          localStorage.removeItem('kvault_access_token');
          localStorage.removeItem('kvault_refresh_token');
          setIsSignedIn(false);
        }
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.success) {
      const { accessToken, refreshToken, user: userData } = response.data;
      localStorage.setItem('kvault_access_token', accessToken);
      localStorage.setItem('kvault_refresh_token', refreshToken);
      setUser({
        id: userData.id,
        name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
        email: userData.email
      });
      setIsSignedIn(true);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await authService.register({
      firstName,
      lastName,
      email,
      password,
      confirmPassword: password
    });
    if (response.success) {
      const { accessToken, refreshToken, user: userData } = response.data;
      localStorage.setItem('kvault_access_token', accessToken);
      localStorage.setItem('kvault_refresh_token', refreshToken);
      setUser({
        id: userData.id,
        name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
        email: userData.email
      });
      setIsSignedIn(true);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Fail gracefully
    }
    localStorage.removeItem('kvault_access_token');
    localStorage.removeItem('kvault_refresh_token');
    setUser(null);
    setIsSignedIn(false);
  };

  return (
    <UserContext.Provider value={{ user, isSignedIn, login, register, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
