import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { validateToken } from '../utils/jwt';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, logout } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Double-check token validity on route access
    const storedToken = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    
    if (!storedToken) {
      // No token found
      setIsValidating(false);
      return;
    }

    // Validate token
    const validation = validateToken(storedToken);
    
    if (!validation.isValid || validation.isExpired) {
      // Token is invalid or expired
      if (import.meta.env.DEV) {
        console.warn('⚠️ Protected route: Token validation failed', validation.error);
      }
      logout();
      setIsValidating(false);
      return;
    }

    // Token is valid
    setIsValidating(false);
  }, [logout]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

