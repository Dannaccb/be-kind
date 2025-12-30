import { config } from '../config';

// Use proxy in development to avoid CORS issues
// In development, use relative paths that will be proxied by Vite
// In production, use full URLs
const getApiUrl = (baseUrl: string, path: string) => {
  if (import.meta.env.DEV) {
    // In development, use relative paths that will be proxied by Vite
    // The proxy will forward these to the actual API server
    return path;
  }
  // In production, use full URLs
  return `${baseUrl}${path}`;
};

export const API_ENDPOINTS = {
  // Login uses /api/Authentication which proxies to authUrl
  LOGIN: getApiUrl(config.api.authUrl, '/api/Authentication/Login'),
  // Actions use /api/v1 which proxies to baseUrl
  ACTIONS_LIST: getApiUrl(config.api.baseUrl, '/api/v1/actions/admin-list'),
  ACTIONS_ADD: getApiUrl(config.api.baseUrl, '/api/v1/actions/admin-add'),
};

if (import.meta.env.DEV) {
  console.log('🔧 API Endpoints (Development - using proxy):', {
    ...API_ENDPOINTS,
    note: 'These relative paths will be proxied by Vite to the actual API servers',
    proxyTargets: {
      '/api/v1/*': 'https://dev.api.bekindnetwork.com',
      '/api/Authentication/*': 'https://dev.apinetbo.bekindnetwork.com',
    },
  });
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: config.storage.tokenKey,
  USER_DATA: config.storage.userDataKey,
};

export const DEFAULT_PAGE_SIZE = config.pagination.defaultPageSize;

