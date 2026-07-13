import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface InstructorRouteProps {
  children: React.ReactNode;
}

export const InstructorRoute: React.FC<InstructorRouteProps> = ({ children }) => {
  const { isSignedIn, user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary dark:bg-bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has instructor or admin role
  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
