/**
 * Application configuration
 */

export const config = {
  app: {
    name: 'be kind network',
    version: '1.0.0',
  },
  api: {
    authUrl: 'https://dev.apinetbo.bekindnetwork.com',
    baseUrl: 'https://dev.api.bekindnetwork.com',
    timeout: 30000,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  validation: {
    minPasswordLength: 6,
    minNameLength: 3,
    maxDescriptionLength: 300,
    minDescriptionLength: 10,
  },
  storage: {
    tokenKey: 'auth_token',
    userDataKey: 'user_data',
  },
} as const;

