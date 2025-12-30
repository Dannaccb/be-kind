import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { isTokenExpired } from '../utils/jwt';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Redirect if already authenticated with valid token
  useEffect(() => {
    const storedToken = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    
    if (storedToken && !isTokenExpired(storedToken) && isAuthenticated) {
      // User is already authenticated with valid token, redirect to dashboard
      navigate('/dashboard', { replace: true });
    } else if (storedToken && isTokenExpired(storedToken)) {
      // Token exists but is expired, clear it
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_DATA);
    }
  }, [navigate, isAuthenticated]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        username: data.email,
        password: data.password,
      });

      // Log full response for debugging
      console.log('Full login response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');

      // Extract token from various possible response structures
      let token: string | null = null;
      
      // If response is a string, it might be the token itself (JWT format)
      if (typeof response === 'string') {
        // Check if it's a JWT token (has 3 parts separated by dots)
        if (response.split('.').length === 3) {
          token = response;
          console.log('Token found as direct string response');
        }
      } else if (response && typeof response === 'object') {
        // Check all possible property names (case insensitive search)
        const responseString = JSON.stringify(response);
        
        // First, try direct property access
        token = 
          response.token ||
          response.accessToken ||
          response.access_token ||
          response.Token ||
          response.AccessToken ||
          response.tokenValue ||
          response.jwt ||
          response.jwtToken ||
          response.data?.token ||
          response.data?.accessToken ||
          response.data?.access_token ||
          response.data?.Token ||
          response.data?.AccessToken ||
          response.result?.token ||
          response.result?.accessToken ||
          response.response?.token ||
          response.response?.accessToken ||
          response.body?.token ||
          response.body?.accessToken;
        
        // If not found, search for JWT pattern in the entire response
        if (!token) {
          // JWT tokens have a specific pattern: three base64 parts separated by dots
          const jwtPattern = /["']?([A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{20,})["']?/g;
          const matches = responseString.match(jwtPattern);
          
          if (matches && matches.length > 0) {
            // Find the longest match (most likely to be the token)
            token = matches.reduce((longest, current) => 
              current.length > longest.length ? current.replace(/["']/g, '') : longest.replace(/["']/g, '')
            , '');
            console.log('Token found using JWT pattern matching');
          }
        }
        
        // If still not found, try regex search for common token property names
        if (!token) {
          const tokenMatch = 
            responseString.match(/"token"\s*:\s*"([^"]+)"/i) || 
            responseString.match(/"accessToken"\s*:\s*"([^"]+)"/i) ||
            responseString.match(/"access_token"\s*:\s*"([^"]+)"/i) ||
            responseString.match(/"Token"\s*:\s*"([^"]+)"/i) ||
            responseString.match(/"AccessToken"\s*:\s*"([^"]+)"/i) ||
            responseString.match(/"jwt"\s*:\s*"([^"]+)"/i) ||
            responseString.match(/"jwtToken"\s*:\s*"([^"]+)"/i);
          
          if (tokenMatch && tokenMatch[1]) {
            token = tokenMatch[1];
            console.log('Token found using regex pattern matching');
          }
        }
      }

      // Final validation: ensure token looks like a JWT
      if (token) {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.warn('Token does not appear to be a valid JWT format');
          token = null;
        } else {
          console.log('✅ Valid JWT token found:', token.substring(0, 20) + '...' + token.substring(token.length - 20));
        }
      }

      if (!token) {
        toast.error('No se recibió token de autenticación. Por favor, verifica las credenciales o contacta al administrador.', {
          icon: '❌',
          autoClose: 6000,
        });
        console.error('❌ Token not found. Full response structure:', JSON.stringify(response, null, 2));
        console.error('Response type:', typeof response);
        if (response && typeof response === 'object') {
          console.error('All response keys:', Object.keys(response));
          console.error('Response values:', Object.values(response));
        }
        return;
      }

      // Extract user information
      const user = 
        response.user ||
        response.data?.user ||
        response.result?.user ||
        {
          id: response.userId || response.id || '1',
          email: data.email,
          name: response.name || response.userName || data.email.split('@')[0],
        };

      // Save token and user data
      login(token, user);
      
      // Verify token was saved
      const savedToken = sessionStorage.getItem('auth_token');
      if (savedToken) {
        console.log('✅ Login successful. Token saved and verified:', savedToken.substring(0, 20) + '...');
      } else {
        console.error('❌ Token was not saved to sessionStorage!');
      }
      
      toast.success('¡Bienvenido! Inicio de sesión exitoso', {
        icon: '✅',
      });
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.Message ||
        'Error al iniciar sesión. Verifica tus credenciales.';
      
      toast.error(errorMessage, {
        icon: '❌',
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-background flex items-center justify-center p-4" style={{ padding: '2%' }}>
      <div className="relative z-10" style={{ width: '90%', maxWidth: '450px' }}>
        <div className="bg-white rounded-2xl shadow-2xl" style={{ padding: '5%', minHeight: '60vh' }}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="be kind network" className="h-16 w-auto" />
          </div>

          {/* Subtitle */}
          <p className="text-gray-600 text-center mb-8 text-sm">
            ¡Empieza a conectar tu comunidad ante buenas acciones!
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico*
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'El correo electrónico es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo electrónico inválido',
                    },
                  })}
                  placeholder="Ingresar correo"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña*
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    },
                  })}
                  placeholder="Ingresa tu contraseña"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Recuperar contraseña
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner w-5 h-5 border-2"></div>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

