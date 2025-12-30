import apiClient from './axios';
import { API_ENDPOINTS } from '../utils/constants';

export interface Action {
  id: string;
  name: string;
  title?: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  icon?: string; // Can be URL or emoji/text
  color?: string;
  status: 'active' | 'inactive' | string | boolean | number; // Can be 1 (active) or 0 (inactive)
  createdAt: string;
  updatedAt?: string;
}

export interface ActionsListResponse {
  data: Action[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateActionRequest {
  name: string;
  description: string;
  categoryId?: string;
  status?: 'active' | 'inactive';
  icon?: string;
  color?: string;
  file?: File; // File for image upload (temporarily disabled)
}

export const actionsApi = {
  getList: async (
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<ActionsListResponse> => {
    try {
      // Token will be added by axios interceptor, but we verify it exists
      const { storage } = await import('../utils/storage');
      const { STORAGE_KEYS } = await import('../utils/constants');
      let token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        const directToken = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (directToken) {
          token = directToken.replace(/^"(.*)"$/, '$1').trim();
        }
      }
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      // Log request for debugging
      if (import.meta.env.DEV) {
        console.log('📋 Actions List Request:', {
          url: API_ENDPOINTS.ACTIONS_LIST,
          params: { pageNumber, pageSize },
          hasToken: !!token,
          tokenPreview: token.substring(0, 30) + '...',
        });
      }

      const response = await apiClient.get(
        API_ENDPOINTS.ACTIONS_LIST,
        {
          params: { 
            pageNumber: Math.max(1, Number(pageNumber)), // API uses 1-based indexing (pageNumber >= 1)
            pageSize: Number(pageSize),
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          validateStatus: (status) => status < 500,
        }
      );

      // Log response for debugging
      if (import.meta.env.DEV) {
        console.log('📥 Actions List Response (Raw):', {
          status: response.status,
          statusText: response.statusText,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : [],
          fullData: response.data,
        });
      }

      // Handle error responses
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
      
      // Handle different response structures
      let responseData = response.data;
      
      if (import.meta.env.DEV) {
        console.log('🔍 Processing response data:', {
          isArray: Array.isArray(responseData),
          hasDataProperty: !!responseData?.data,
          keys: responseData ? Object.keys(responseData) : [],
        });
      }
      
      // If response.data is an array directly
      if (Array.isArray(responseData)) {
        const result = {
          data: responseData as Action[],
          totalCount: responseData.length,
          pageNumber,
          pageSize,
          totalPages: Math.ceil(responseData.length / pageSize),
        };
        if (import.meta.env.DEV) {
          console.log('✅ Returning array response:', result);
        }
        return result;
      }
      
      // If response.data has data property, use it
      if (responseData?.data) {
        // Check if data.data exists (double nested structure)
        const innerData = responseData.data;
        if (innerData?.data && Array.isArray(innerData.data)) {
          // Structure: { data: { data: [...], pageSize, pageNumber, totalElements, totalPages } }
          const dataArray = innerData.data as Action[];
          const result = {
            data: dataArray,
            totalCount: innerData.totalElements || innerData.totalCount || innerData.total || dataArray.length,
            pageNumber: innerData.pageNumber !== undefined ? innerData.pageNumber : pageNumber, // API uses 1-based (pageNumber from API is already 1-based)
            pageSize: innerData.pageSize || pageSize,
            totalPages: innerData.totalPages || Math.ceil((innerData.totalElements || innerData.totalCount || innerData.total || dataArray.length) / (innerData.pageSize || pageSize)),
          };
          if (import.meta.env.DEV) {
            console.log('✅ Returning double nested data response:', result);
          }
          return result;
        }
        
        // Structure: { data: [...] } - single nested
        const dataArray = Array.isArray(responseData.data) ? responseData.data : [];
        const result = {
          data: dataArray as Action[],
          totalCount: responseData.totalCount || responseData.totalElements || responseData.total || responseData.count || dataArray.length,
            pageNumber: responseData.pageNumber !== undefined ? responseData.pageNumber : pageNumber, // API uses 1-based (pageNumber from API is already 1-based)
          pageSize: responseData.pageSize || pageSize,
          totalPages: responseData.totalPages || Math.ceil((responseData.totalCount || responseData.totalElements || responseData.total || responseData.count || dataArray.length) / (responseData.pageSize || pageSize)),
        };
        if (import.meta.env.DEV) {
          console.log('✅ Returning nested data response:', result);
        }
        return result;
      }
      
      // If response.data has the expected structure with other property names
      if (responseData && typeof responseData === 'object') {
        const dataArray = responseData.items || responseData.results || responseData.actions || [];
        const total = responseData.totalCount || responseData.total || responseData.count || dataArray.length;
        const result = {
          data: Array.isArray(dataArray) ? dataArray as Action[] : [],
          totalCount: total,
          pageNumber: responseData.pageNumber || pageNumber,
          pageSize: responseData.pageSize || pageSize,
          totalPages: responseData.totalPages || Math.ceil(total / (responseData.pageSize || pageSize)),
        };
        if (import.meta.env.DEV) {
          console.log('✅ Returning object response:', result);
        }
        return result;
      }
      
      // Fallback - empty response
      if (import.meta.env.DEV) {
        console.warn('⚠️ No data structure recognized, returning empty response');
      }
      return {
        data: [],
        totalCount: 0,
        pageNumber,
        pageSize,
        totalPages: 0,
      };
    } catch (error: any) {
      if (error.response) {
        throw {
          message: error.response.data?.message || error.response.data?.error || error.response.data?.Message || 'Error al cargar las acciones',
          status: error.response.status,
          data: error.response.data,
        };
      } else if (error.request) {
        throw {
          message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
          status: 0,
        };
      } else {
        throw {
          message: error.message || 'Error inesperado al cargar las acciones',
          status: 0,
        };
      }
    }
  },

  create: async (action: CreateActionRequest): Promise<Action> => {
    try {
      // Server requires FormData (multipart/form-data), not JSON
      const hasFile = action.file instanceof File;
      
      // Convert status to Integer format (server expects Integer, not string)
      // 1 = active, 0 = inactive (common pattern)
      let statusValue: number = 1; // Default to active
      if (typeof action.status === 'string') {
        statusValue = action.status === 'active' ? 1 : 0;
      } else if (typeof action.status === 'boolean') {
        statusValue = action.status ? 1 : 0;
      } else if (typeof action.status === 'number') {
        statusValue = action.status;
      }
      
      // Create FormData for file upload (required by server)
      const formData = new FormData();
      formData.append('name', action.name);
      formData.append('description', action.description);
      formData.append('status', statusValue.toString()); // Convert number to string for FormData
      
      if (action.color) {
        formData.append('color', action.color);
      }
      
      if (action.categoryId) {
        formData.append('categoryId', action.categoryId);
      }
      
      // Append file as 'icon' field (server expects 'icon' field, not 'file')
      if (hasFile && action.file) {
        formData.append('icon', action.file, action.file.name);
      } else if (action.icon) {
        // If no file but icon name provided, send it as string
        formData.append('icon', action.icon);
      } else {
        // Icon is required by server, throw error if not provided
        throw new Error('El icono (imagen) es requerido para crear la acción');
      }
      
      const requestData = formData;
      
      // Don't set Content-Type for FormData - browser will set it with boundary
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        // Content-Type will be set by browser with boundary for FormData
      };

      // Log request for debugging
      if (import.meta.env.DEV) {
        // Extract FormData entries for logging
        const formDataEntries: Record<string, string> = {};
        formData.forEach((value, key) => {
          if (value instanceof File) {
            formDataEntries[key] = `File: ${value.name} (${(value.size / 1024).toFixed(2)} KB, ${value.type})`;
          } else {
            formDataEntries[key] = value.toString();
          }
        });
        
        const logData: any = {
          url: API_ENDPOINTS.ACTIONS_ADD,
          fullUrl: API_ENDPOINTS.ACTIONS_ADD.startsWith('http') 
            ? API_ENDPOINTS.ACTIONS_ADD 
            : `${window.location.origin}${API_ENDPOINTS.ACTIONS_ADD}`,
          method: 'POST',
          contentType: 'multipart/form-data (FormData)',
          headers: { ...headers },
          formDataFields: formDataEntries,
        };
        
        console.log('📤 Create Action Request:', logData);
      }

      const response = await apiClient.post(
        API_ENDPOINTS.ACTIONS_ADD,
        requestData,
        {
          headers,
          validateStatus: (status) => status < 500,
        }
      );

      // Log response for debugging
      if (import.meta.env.DEV) {
        console.log('Create Action Response:', {
          status: response.status,
          data: response.data,
        });
      }

      // Handle error responses
      if (response.status >= 400) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        // Try to extract error message from different response formats
        if (typeof response.data === 'string') {
          errorMessage = response.data;
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        } else if (response.data?.error) {
          errorMessage = response.data.error;
        } else if (response.data?.Message) {
          errorMessage = response.data.Message;
        }
        
        // Special handling for CORS errors
        if (response.status === 403 && (errorMessage.includes('CORS') || errorMessage.includes('cors'))) {
          errorMessage = 'Error de CORS: El servidor rechazó la petición. Verifica que el proxy esté funcionando correctamente o que el servidor permita peticiones desde este origen.';
        }
        
        throw {
          message: errorMessage,
          status: response.status,
          data: response.data,
        };
      }
      
      // Handle different response structures
      if (response.data) {
        // If response.data has data property
        if (response.data.data) {
          return response.data.data as Action;
        }
        // If response.data is the action itself
        if (response.data.id || response.data.name) {
          return response.data as Action;
        }
        // If response.data has result property
        if (response.data.result) {
          return response.data.result as Action;
        }
      }
      
      throw new Error('Respuesta inválida del servidor');
    } catch (error: any) {
      if (error.response) {
        throw {
          message: error.response.data?.message || error.response.data?.error || error.response.data?.Message || 'Error al crear la acción',
          status: error.response.status,
          data: error.response.data,
        };
      } else if (error.request) {
        throw {
          message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
          status: 0,
        };
      } else {
        throw {
          message: error.message || 'Error inesperado al crear la acción',
          status: 0,
        };
      }
    }
  },
};
