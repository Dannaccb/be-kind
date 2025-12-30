import axios from 'axios';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { config } from '../config';
import { validateToken } from '../utils/jwt';

const apiClient = axios.create({
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from storage (try both methods to be sure)
    let token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    
    // If not found, try direct sessionStorage access
    if (!token) {
      const directToken = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (directToken) {
        // Remove quotes if it's a JSON string
        token = directToken.replace(/^"(.*)"$/, '$1');
      }
    }
    
    if (token) {
      // Clean token (remove any quotes or whitespace)
      token = token.trim().replace(/^["']|["']$/g, '');
      
      // Validate token before adding to request
      const validation = validateToken(token);
      
      if (!validation.isValid || validation.isExpired) {
        // Token is invalid or expired - clear storage and reject request
        if (import.meta.env.DEV) {
          console.error('❌ Token validation failed before request:', {
            url: config.url,
            method: config.method?.toUpperCase(),
            error: validation.error,
            isExpired: validation.isExpired,
          });
        }
        
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.USER_DATA);
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject({
          message: 'Token expired or invalid. Please login again.',
          status: 401,
          isTokenExpired: true,
        });
      }
      
      // Remove any existing Authorization header and set the new one
      delete config.headers.Authorization;
      config.headers.Authorization = `Bearer ${token}`;
      
      if (import.meta.env.DEV) {
        console.log('✅ Valid token added to request:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          tokenPreview: token.substring(0, 30) + '...',
          tokenLength: token.length,
          headerSet: !!config.headers.Authorization,
        });
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('⚠️ No token found for request:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          storageKey: STORAGE_KEYS.AUTH_TOKEN,
        });
      }
      
      // If this is a protected endpoint (not login), reject the request
      if (config.url && !config.url.includes('/Login') && !config.url.includes('/login')) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject({
          message: 'No authentication token found. Please login.',
          status: 401,
          isTokenExpired: false,
        });
      }
    }
    
    // Handle Content-Type for different data types
    if (config.data instanceof FormData) {
      // Remove Content-Type for FormData - browser will set it automatically with boundary
      delete config.headers['Content-Type'];
      // Also remove it from commonContentType if it exists
      if (config.headers['common'] && config.headers['common']['Content-Type']) {
        delete config.headers['common']['Content-Type'];
      }
    } else if (!config.headers['Content-Type']) {
      // Set Content-Type for JSON requests
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Ensure Accept header is set
    if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/json';
    }
    
    // Log full request details for debugging
    if (import.meta.env.DEV) {
      console.log('📤 API Request Details:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: !!token,
        tokenLength: token?.length || 0,
        params: config.params,
        headers: {
          Authorization: config.headers.Authorization ? `Bearer ${token?.substring(0, 20)}...` : 'Not set',
          'Content-Type': config.headers['Content-Type'],
          'Accept': config.headers['Accept'],
        },
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (remove in production)
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        isCorsError: !error.response && error.message === 'Network Error',
      });
    }
    
    // Handle CORS errors
    if (!error.response && error.message === 'Network Error') {
      const corsErrorMessage = 'Error de CORS: El servidor no permite peticiones desde este origen. ' +
        'Esto puede deberse a que el servidor no tiene configurado CORS correctamente. ' +
        'Por favor, contacta al administrador del sistema.';
      
      return Promise.reject({
        message: corsErrorMessage,
        status: 0,
        isCorsError: true,
        originalError: error,
      });
    }
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_DATA);
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Return error with better structure
    return Promise.reject({
      message: error.response?.data?.message || 
               error.response?.data?.error || 
               error.message || 
               'Error en la petición',
      status: error.response?.status || 0,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default apiClient;

