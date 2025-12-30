import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message?: string;
  success?: boolean;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<any> => {
    try {
      // Log request for debugging
      if (import.meta.env.DEV) {
        console.log('Login Request:', {
          url: API_ENDPOINTS.LOGIN,
          credentials: { ...credentials, password: '***' },
        });
      }

      const response = await axios.post(
        API_ENDPOINTS.LOGIN,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
          validateStatus: (status) => status < 500, // Don't throw on 4xx errors
        }
      );

      // Log full response for debugging
      if (import.meta.env.DEV) {
        console.log('Login Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
        });
      }

      // Handle error responses (4xx)
      if (response.status >= 400) {
        const errorMessage = 
          response.data?.message || 
          response.data?.error || 
          response.data?.Message ||
          `Error ${response.status}: ${response.statusText}`;
        
        throw {
          message: errorMessage,
          status: response.status,
          data: response.data,
        };
      }

      // Return the full response data
      return response.data;
    } catch (error: any) {
      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = 
          error.response.data?.message || 
          error.response.data?.error || 
          error.response.data?.Message ||
          `Error ${error.response.status}: ${error.response.statusText}`;
        
        throw {
          message: errorMessage,
          status: error.response.status,
          data: error.response.data,
        };
      } else if (error.request) {
        // Request was made but no response received
        throw {
          message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
          status: 0,
        };
      } else {
        // Something else happened
        throw {
          message: error.message || 'Error inesperado al iniciar sesión',
          status: 0,
        };
      }
    }
  },
};

