'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { User } from '@/lib/types';
import { loginUser, registerUser, loginWithGoogle as apiLoginWithGoogle, setAuthToken } from '@/lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, phone?: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (emailOrPayload?: string | { credential?: string; idToken?: string; email?: string; name?: string }, customName?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function subscribeAuth(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('aurelia_user_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('aurelia_user_change', callback);
  };
}

function getAuthSnapshot(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('aurelia_user') || '';
  } catch {
    return '';
  }
}

function getAuthServerSnapshot(): string {
  return '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const userJson = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);

  const user: User | null = useMemo(() => {
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }, [userJson]);

  const { success, error } = useToast();

  const setUser = (u: User | null) => {
    if (typeof window !== 'undefined') {
      try {
        if (u) {
          localStorage.setItem('aurelia_user', JSON.stringify(u));
        } else {
          localStorage.removeItem('aurelia_user');
          setAuthToken(null);
        }
        window.dispatchEvent(new Event('aurelia_user_change'));
      } catch {
        // ignore write errors
      }
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await loginUser(email, password);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        success('Welcome to Maison Aurelia', `Authenticated as ${res.data.user.name}`);
        return true;
      } else {
        error('Authentication Failed', res.error || 'Invalid credentials');
        return false;
      }
    } catch (err: any) {
      error('Authentication Error', err.message || 'Could not connect to atelier server');
      return false;
    }
  };

  const register = async (name: string, email: string, phone?: string, password?: string): Promise<boolean> => {
    try {
      const res = await registerUser({ name, email, phone, password });
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        success('Privileges Granted', `Welcome to the Maison, ${res.data.user.name}`);
        return true;
      } else {
        error('Registration Failed', res.error || 'Could not create account');
        return false;
      }
    } catch (err: any) {
      error('Registration Error', err.message);
      return false;
    }
  };

  const loginWithGoogle = async (
    emailOrPayload?: string | { credential?: string; idToken?: string; email?: string; name?: string },
    customName?: string
  ): Promise<boolean> => {
    try {
      let payload: { credential?: string; idToken?: string; email?: string; name?: string } = {};
      if (typeof emailOrPayload === 'string') {
        payload = { email: emailOrPayload, name: customName || 'Patron Client' };
      } else if (emailOrPayload && typeof emailOrPayload === 'object') {
        payload = emailOrPayload;
      }

      const res = await apiLoginWithGoogle(payload);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        success('Google Sign-In Successful', `Welcome, ${res.data.user.name}`);
        return true;
      } else {
        error('Google Authentication Failed', res.error || 'Could not verify Google identity.');
        return false;
      }
    } catch (err: any) {
      error('Authentication Error', err.message);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setAuthToken(null);
    try {
      const { logoutUser } = await import('@/lib/api');
      await logoutUser();
    } catch {
      // ignore
    }
    success('Session Concluded', 'You have been safely signed out.');
  };

  const role = user?.role?.toLowerCase() || '';
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isStaff = ['admin', 'superadmin', 'atelier_staff', 'gemologist', 'master_jeweller', 'manager'].includes(role);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading: false, 
      isAdmin, 
      isSuperAdmin,
      isStaff,
      login, 
      register, 
      loginWithGoogle, 
      logout, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
