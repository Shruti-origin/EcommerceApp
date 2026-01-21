import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';
import { UserRole } from '../types/enums';
import apiClient from '../services/apiClient';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🔄 AuthProvider initializing...');
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user from localStorage on mount and check token validity
  useEffect(() => {
    console.log('🔄 AuthProvider useEffect running...');
    
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('🔍 Loading stored auth data:', { hasToken: !!token, hasUser: !!userStr });

        if (token && userStr) {
          // Check if token is a JWT and if it's expired
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const expirationTime = payload.exp * 1000; // Convert to milliseconds
              
              // Add 5 minutes buffer to avoid premature deletion
              const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
              
              if (Date.now() >= (expirationTime + bufferTime)) {
                console.warn('⚠️ Token expired on load, clearing auth data...');
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setAuthState((prev) => ({ ...prev, isLoading: false }));
                return;
              } else if (Date.now() >= expirationTime) {
                console.warn('⚠️ Token will expire soon but still valid...');
              }
            }
          } catch (e) {
            console.warn('Could not parse token for expiration check:', e);
          }

          const user = JSON.parse(userStr);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('✅ User loaded from storage:', user.email, user.role);
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          console.log('ℹ️ No stored authentication found');
        }
      } catch (error) {
        console.error('❌ Failed to load user:', error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();

    // Listen for token expiration events from API client
    const handleTokenExpired = () => {
      console.log('🔴 Token expired event received, logging out...');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    globalThis.addEventListener('tokenExpired', handleTokenExpired);
    return () => {
      globalThis.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const login = async (credentials: LoginCredentials, role?: UserRole) => {
    try {
      // Determine the login endpoint based on role
      let endpoint = '/auth/login';
      if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
        endpoint = '/auth/login';
      } else if (role === UserRole.VENDOR) {
        endpoint = '/auth/login';
      }
      
      const response = await apiClient.post(endpoint, credentials);
      console.log('🔍 Login response:', response);
      
      // Extract token from various possible field names
      const authToken = response.token || response.accessToken || response.access_token;
      const user = response.user;
      
      if (!authToken || !user) {
        throw new Error('Invalid response from server: missing token or user data');
      }
      
      console.log('✅ Extracted token:', authToken);
      console.log('✅ User data:', user);
      
      // Store in localStorage (use both 'token' and 'authToken' for compatibility)
      localStorage.setItem('token', authToken);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: authToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Dispatch login success event for cart sync
      globalThis.dispatchEvent(new CustomEvent('loginSuccess', { 
        detail: { token: authToken, user } 
      }));

      console.log('✅ Login successful, role:', user.role);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const logout = () => {
    // Remove all authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    console.log('👋 User logged out');

    // Notify other parts of the app that logout happened
    try {
      globalThis.dispatchEvent(new CustomEvent('logout'));
    } catch (e) {
      console.warn('Could not dispatch logout event', e);
    }
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth called outside AuthProvider. Current location:', window.location.pathname);
    console.error('Stack trace:', new Error().stack);
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
