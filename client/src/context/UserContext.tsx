import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export interface User {
  id?: string;
  name: string;
  email: string;
  location?: string;
  profileName?: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  role?: string;
}

interface UserContextType {
  user: User | null;
  isSignedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, id?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const customSetUser = (u: User | null) => {
    setUser(u);
    setIsSignedIn(!!u);
  };

  useEffect(() => {
    const initializeAuth = async () => {

      try {
        const response = await authService.getMe();
        if (response.success && response.data?.user) {
          const userData = response.data.user;
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar,
            profileName: userData.profileName,
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
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        profileName: userData.profileName,
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
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        profileName: userData.profileName,
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

  const updateUserProfile = async (profileData: Partial<User>) => {
    try {
      await userService.updateProfile({
        profileName: profileData.profileName,
        bio: profileData.bio,
        twitterUrl: profileData.twitterUrl,
        linkedinUrl: profileData.linkedinUrl,
        websiteUrl: profileData.websiteUrl,
      });
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          profileName: userData.profileName,
          avatar: userData.avatar,
          bio: userData.bio,
          phoneNumber: userData.phoneNumber,
          twitterUrl: userData.twitterUrl,
          linkedinUrl: userData.linkedinUrl,
          websiteUrl: userData.websiteUrl,
          role: userData.role,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, isSignedIn, loading, login, register, logout, setUser: customSetUser, updateUserProfile, fetchUserProfile }}>
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