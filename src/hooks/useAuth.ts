import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * Provides a cleaner API for components
 */
export const useAuth = () => {
  return useAuthContext();
};

