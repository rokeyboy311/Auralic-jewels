'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/types';
import { 
  getCurrentUserProfile, 
  loginUser, 
  registerUser, 
  loginWithGoogle as apiLoginWithGoogle, 
  logoutUser 
} from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, pass?: string) => Promise<boolean>;
  loginWithEmail: (email: string, pass?: string) => Promise<boolean>;
  register: (
    nameOrData: string | { name: string; email: string; password?: string; phone?: string },
    email?: string,
    phone?: string,
    password?: string
  ) => Promise<boolean>;
  registerUser: (
    nameOrData: string | { name: string; email: string; password?: string; phone?: string },
    email?: string,
    phone?: string,
    password?: string
  ) => Promise<boolean>;
  loginWithGoogle: (payload?: { credential?: string; idToken?: string; email?: string; name?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await getCurrentUserProfile();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginWithEmail = async (email: string, pass?: string): Promise<boolean> => {
    try {
      const res = await loginUser(email, pass);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (
    nameOrData: string | { name: string; email: string; password?: string; phone?: string },
    email?: string,
    phone?: string,
    password?: string
  ): Promise<boolean> => {
    try {
      let payload: { name: string; email: string; password?: string; phone?: string };
      if (typeof nameOrData === 'object') {
        payload = nameOrData;
      } else {
        payload = {
          name: nameOrData,
          email: email || '',
          phone: phone || '',
          password: password || '',
        };
      }

      const res = await registerUser(payload);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const loginWithGoogle = async (payload?: { credential?: string; idToken?: string; email?: string; name?: string }): Promise<boolean> => {
    try {
      const res = await apiLoginWithGoogle(payload);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const role = (user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isStaff = isAdmin || role === 'staff' || role === 'curator' || role === 'gemologist';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isStaff,
        setUser,
        login: loginWithEmail,
        loginWithEmail,
        register,
        registerUser: register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
