import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { validateToken, isTokenExpired } from '../utils/jwt';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = storage.get<User>(STORAGE_KEYS.USER_DATA);

    // Validate token before setting authentication state
    if (storedToken) {
      const validation = validateToken(storedToken);
      
      if (validation.isValid && !validation.isExpired && storedUser) {
        // Token is valid and not expired
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
        
        if (import.meta.env.DEV) {
          console.log('✅ Valid token found, user authenticated');
        }
      } else {
        // Token is expired or invalid - clear storage
        if (import.meta.env.DEV) {
          console.warn('⚠️ Token validation failed:', validation.error || 'Token expired');
        }
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.USER_DATA);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      // No token found
      setIsAuthenticated(false);
    }
  }, []);

  // Check token expiration periodically (every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Token expired during session, logging out');
        }
        logout();
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    storage.set(STORAGE_KEYS.AUTH_TOKEN, newToken);
    storage.set(STORAGE_KEYS.USER_DATA, newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_DATA);
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      logout,
    }),
    [user, token, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

