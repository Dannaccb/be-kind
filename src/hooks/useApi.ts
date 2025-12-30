import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

/**
 * Custom hook for handling API calls with loading and error states
 */
export const useApi = <T,>(options: UseApiOptions = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operación exitosa',
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Ocurrió un error inesperado';

        setError(errorMessage);

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, showSuccessToast, showErrorToast, successMessage]
  );

  return {
    execute,
    isLoading,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
    },
  };
};

