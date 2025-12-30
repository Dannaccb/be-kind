import { toast, ToastOptions } from 'react-toastify';

/**
 * Custom toast utilities with better styling and icons
 */

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const toastUtils = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
      className: 'toast-custom',
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...defaultOptions,
      ...options,
      className: 'toast-custom',
      autoClose: 5000, // Errors stay longer
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      ...defaultOptions,
      ...options,
      className: 'toast-custom',
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      ...defaultOptions,
      ...options,
      className: 'toast-custom',
    });
  },
};

