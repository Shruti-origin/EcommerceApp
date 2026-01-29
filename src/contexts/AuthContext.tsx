import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';
import { UserRole } from '../types/enums';
import apiClient from '../services/apiClient';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lightweight cross-platform event bus
// - On platforms where globalThis.addEventListener/dispatchEvent exist (web), it delegates to them
// - On platforms like React Native, it falls back to a Map-based in-memory pub/sub
const eventBus = (() => {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).addEventListener === 'function' && typeof (globalThis as any).dispatchEvent === 'function') {
    return {
      add: (name: string, handler: any) => (globalThis as any).addEventListener(name, handler),
      remove: (name: string, handler: any) => (globalThis as any).removeEventListener(name, handler),
      dispatch: (name: string, detail?: any) => {
        try {
          const CE = (globalThis as any).CustomEvent;
          if (CE) (globalThis as any).dispatchEvent(new CE(name, { detail }));
          else (globalThis as any).dispatchEvent({ type: name, detail });
        } catch (e) {
          // ignore dispatch errors
        }
      },
    };
  }

  const map: Map<string, Set<Function>> = (globalThis as any).__appEventMap || new Map();
  (globalThis as any).__appEventMap = map;
  return {
    add: (name: string, handler: Function) => {
      const s = map.get(name) || new Set<Function>();
      s.add(handler);
      map.set(name, s);
    },
    remove: (name: string, handler: Function) => {
      const s = map.get(name);
      if (s) {
        s.delete(handler);
        if (s.size === 0) map.delete(name);
      }
    },
    dispatch: (name: string, detail?: any) => {
      const s = map.get(name);
      if (s) {
        for (const h of Array.from(s)) {
          try {
            h({ detail });
          } catch (e) {
            console.warn('Event handler error for', name, e);
          }
        }
      }
    },
  };
})();

// Storage abstraction: tries `localStorage` first (web), falls back to AsyncStorage (React Native)
const storage = {
  getItem: async (k: string) => {
    if (typeof (globalThis as any).localStorage !== 'undefined') return (globalThis as any).localStorage.getItem(k);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return await AsyncStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  setItem: async (k: string, v: string) => {
    if (typeof (globalThis as any).localStorage !== 'undefined') return (globalThis as any).localStorage.setItem(k, v);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return await AsyncStorage.setItem(k, v);
    } catch (e) {
      return undefined;
    }
  },
  removeItem: async (k: string) => {
    if (typeof (globalThis as any).localStorage !== 'undefined') return (globalThis as any).localStorage.removeItem(k);
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return await AsyncStorage.removeItem(k);
    } catch (e) {
      return undefined;
    }
  },
};

// Safe base64 decode helper for token payloads
const decodeBase64 = (s: string) => {
  if (!s) return '';
  try {
    if (typeof (globalThis as any).atob === 'function') return (globalThis as any).atob(s);
  } catch (e) {}
  try {
    const Buf = (globalThis as any).Buffer;
    if (Buf && typeof Buf.from === 'function') return Buf.from(s, 'base64').toString('utf8');
  } catch (e) {}
  return '';
};

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
        const token = await storage.getItem('token');
        const userStr = await storage.getItem('user');
        
        console.log('🔍 Loading stored auth data:', { hasToken: !!token, hasUser: !!userStr });

        if (token && userStr) {
          // Check if token is a JWT and if it's expired
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payloadStr = decodeBase64(tokenParts[1]);
              const payload = payloadStr ? JSON.parse(payloadStr) : null;
              const expirationTime = payload?.exp ? payload.exp * 1000 : 0; // Convert to milliseconds
              
              // Add 5 minutes buffer to avoid premature deletion
              const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
              
              if (expirationTime && Date.now() >= (expirationTime + bufferTime)) {
                console.warn('⚠️ Token expired on load, clearing auth data...');
                await storage.removeItem('token');
                await storage.removeItem('authToken');
                await storage.removeItem('user');
                setAuthState((prev) => ({ ...prev, isLoading: false }));
                return;
              } else if (expirationTime && Date.now() >= expirationTime) {
                console.warn('⚠️ Token will expire soon but still valid...');
              }
            }
          } catch (e) {
            console.warn('Could not parse token for expiration check:', e);
          }

          const user = JSON.parse(userStr as string);
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

    eventBus.add('tokenExpired', handleTokenExpired);
    return () => {
      eventBus.remove('tokenExpired', handleTokenExpired);
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
      
      // Store token and user using storage abstraction
      await storage.setItem('token', authToken);
      await storage.setItem('authToken', authToken);
      await storage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token: authToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Dispatch login success event for cart sync
      eventBus.dispatch('loginSuccess', { token: authToken, user });

      console.log('✅ Login successful, role:', user.role);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const logout = async () => {
    // Remove all authentication tokens
    await storage.removeItem('token');
    await storage.removeItem('authToken');
    await storage.removeItem('userToken');
    await storage.removeItem('user');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    console.log('👋 User logged out');

    // Notify other parts of the app that logout happened
    try {
      eventBus.dispatch('logout');
    } catch (e) {
      console.warn('Could not dispatch logout event', e);
    }
  };

  const updateUser = async (user: User) => {
    await storage.setItem('user', JSON.stringify(user));
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
    console.error('useAuth called outside AuthProvider. Current location:', typeof (globalThis as any).window !== 'undefined' ? (globalThis as any).window.location?.pathname : 'unknown');
    console.error('Stack trace:', new Error().stack);
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
