import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('SCHOOL' | 'TEACHER')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedUserTypes,
  redirectTo = '/login'
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setShouldRedirect(true);
      } else if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
        // User is authenticated but doesn't have the right user type
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    }
  }, [isAuthenticated, user, allowedUserTypes, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated or wrong user type
  if (shouldRedirect) {
    // Store the attempted location to redirect back after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render the protected content
  return <>{children}</>;
}; 