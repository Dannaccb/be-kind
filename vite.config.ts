import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Include .tsx files
      include: '**/*.{jsx,tsx}',
    }),
  ],
  server: {
    port: 3000,
    open: true,
    host: true,
    strictPort: false,
    proxy: {
      // Proxy for actions API (baseUrl)
      '/api/v1': {
        target: 'https://dev.api.bekindnetwork.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const targetUrl = `https://dev.api.bekindnetwork.com${proxyReq.path}`;
            console.log('🔄 Proxying request:', req.method, req.url, '→', targetUrl);
            
            // Remove Origin header to avoid CORS issues
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('Origin');
            
            // Set proper headers for the target server
            proxyReq.setHeader('host', 'dev.api.bekindnetwork.com');
            
            // Log headers for debugging
            if (req.method === 'POST') {
              const contentType = proxyReq.getHeader('content-type');
              const authHeader = proxyReq.getHeader('authorization');
              console.log('📋 Request headers:', {
                'content-type': contentType || 'Not set',
                'authorization': authHeader ? 'Bearer ***' : 'Not set',
                'content-length': proxyReq.getHeader('content-length') || 'Not set',
                'host': proxyReq.getHeader('host'),
              });
              
              // Ensure Content-Type is preserved for FormData
              if (contentType && contentType.includes('multipart/form-data')) {
                console.log('📎 FormData detected, preserving Content-Type with boundary');
              }
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
            
            // Add CORS headers to response if needed
            proxyRes.headers['access-control-allow-origin'] = '*';
            proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization';
            
            if (proxyRes.statusCode >= 400) {
              console.log('⚠️ Error response status:', proxyRes.statusCode);
              // Try to read response body for error details
              let body = '';
              proxyRes.on('data', (chunk) => {
                body += chunk.toString();
              });
              proxyRes.on('end', () => {
                if (body) {
                  console.log('📄 Error response body:', body.substring(0, 200));
                }
              });
            }
          });
        },
      },
      // Proxy for auth API (authUrl)
      '/api/Authentication': {
        target: 'https://dev.apinetbo.bekindnetwork.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying auth request:', req.method, req.url, '→', proxyReq.path);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})

