/**
 * JWT Token validation utilities
 * Validates token expiration and structure
 */

export interface JWTDecoded {
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This does NOT verify the signature, only decodes the payload
 */
export const decodeJWT = (token: string): JWTDecoded | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Invalid JWT format: token does not have 3 parts');
      }
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed (base64url may not have padding)
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    
    // Decode base64url
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // Parse JSON
    const parsed = JSON.parse(decodedPayload);
    
    return parsed as JWTDecoded;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('❌ Error decoding JWT:', error);
    }
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false if valid
 */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Token is empty or invalid');
    }
    return true;
  }

  const decoded = decodeJWT(token);
  
  if (!decoded) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Could not decode token');
    }
    return true;
  }

  // Check if token has expiration claim
  if (!decoded.exp) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Token does not have expiration claim (exp)');
    }
    // If no expiration, consider it invalid for security
    return true;
  }

  // Get current time in seconds (JWT exp is in seconds, not milliseconds)
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check if token is expired (with 30 second buffer to account for clock skew)
  const isExpired = decoded.exp < (currentTime - 30);
  
  if (isExpired && import.meta.env.DEV) {
    const expirationDate = new Date(decoded.exp * 1000);
    const now = new Date();
    console.warn('⚠️ Token expired:', {
      expiredAt: expirationDate.toISOString(),
      currentTime: now.toISOString(),
      secondsSinceExpiration: currentTime - decoded.exp,
    });
  }

  return isExpired;
};

/**
 * Get token expiration date
 * @param token - JWT token string
 * @returns Date object or null if token is invalid
 */
export const getTokenExpiration = (token: string | null | undefined): Date | null => {
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
};

/**
 * Get time until token expiration in seconds
 * @param token - JWT token string
 * @returns seconds until expiration, or null if token is invalid/expired
 */
export const getTimeUntilExpiration = (token: string | null | undefined): number | null => {
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiration = decoded.exp - currentTime;
  
  return timeUntilExpiration > 0 ? timeUntilExpiration : null;
};

/**
 * Validate token structure and expiration
 * @param token - JWT token string
 * @returns object with validation results
 */
export const validateToken = (token: string | null | undefined): {
  isValid: boolean;
  isExpired: boolean;
  hasValidStructure: boolean;
  decoded?: JWTDecoded;
  error?: string;
} => {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      isValid: false,
      isExpired: true,
      hasValidStructure: false,
      error: 'Token is empty or invalid',
    };
  }

  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return {
      isValid: false,
      isExpired: true,
      hasValidStructure: false,
      error: 'Could not decode token',
    };
  }

  const expired = isTokenExpired(token);
  
  return {
    isValid: !expired,
    isExpired: expired,
    hasValidStructure: true,
    decoded,
    error: expired ? 'Token has expired' : undefined,
  };
};

