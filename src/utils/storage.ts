export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) {
        if (import.meta.env.DEV) {
          console.log(`📭 Storage get: key "${key}" not found`);
        }
        return null;
      }
      
      // If it looks like a JWT token (contains dots and is long), return as string
      if (item.includes('.') && item.length > 50 && !item.startsWith('{') && !item.startsWith('[')) {
        if (import.meta.env.DEV) {
          console.log(`✅ Storage get: returning JWT token for key "${key}"`);
        }
        return item as unknown as T;
      }
      
      // If it's a quoted string, try to parse it
      if (item.startsWith('"') && item.endsWith('"')) {
        try {
          const parsed = JSON.parse(item);
          if (import.meta.env.DEV) {
            console.log(`✅ Storage get: parsed quoted string for key "${key}"`);
          }
          return parsed as T;
        } catch {
          // If JSON parse fails, return as string without quotes
          const unquoted = item.slice(1, -1);
          if (import.meta.env.DEV) {
            console.log(`✅ Storage get: returning unquoted string for key "${key}"`);
          }
          return unquoted as unknown as T;
        }
      }
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(item);
        if (import.meta.env.DEV) {
          console.log(`✅ Storage get: parsed JSON for key "${key}"`);
        }
        return parsed as T;
      } catch {
        // If it's not valid JSON, return as string
        if (import.meta.env.DEV) {
          console.log(`✅ Storage get: returning raw string for key "${key}"`);
        }
        return item as unknown as T;
      }
    } catch (error) {
      console.error('❌ Error reading from sessionStorage:', error);
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      // If value is a string (like token), store it directly
      if (typeof value === 'string') {
        sessionStorage.setItem(key, value);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
      
      if (import.meta.env.DEV) {
        console.log('✅ Storage set:', key, typeof value === 'string' ? value.substring(0, 20) + '...' : value);
      }
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },
};

