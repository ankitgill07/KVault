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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, id?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {

      try {
        const response = await authService.getMe();
        if (response.success && response.data?.user) {
          const userData = response.data.user;
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email
          });
          setIsSignedIn(true);
        } else {
          setUser(null);
          setIsSignedIn(false);
        }
        setLoading(false);
      } catch (err) {
        setUser(null);
        setIsSignedIn(false);
        setLoading(false);
      }
    };
    initializeAuth();

    const handleAuthFailure = () => {
      setUser(null);
      setIsSignedIn(false);
      setLoading(false);
    };

    window.addEventListener('auth-failure', handleAuthFailure);
    return () => window.removeEventListener('auth-failure', handleAuthFailure);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.success) {
      const { user: userData } = response.data;
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email
      });
      setIsSignedIn(true);
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, _password?: string) => {
    const response = await authService.register({
      name,
      email,
      password: _password || '',
      confirmPassword: _password || '',
    });
    if (response.success) {
      const { user: userData } = response.data;
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email
      });
      setIsSignedIn(true);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Fail gracefully
    }
    setUser(null);
    setIsSignedIn(false);
  };

  return (
    <UserContext.Provider value={{ user, isSignedIn, loading, login, register, logout, setUser }}>
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