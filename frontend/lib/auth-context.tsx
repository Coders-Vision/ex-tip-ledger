'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from './types';
import { getStoredUser, storeAuthData, clearAuthData } from './api';
import { loginAction } from '@/app/actions/auth';

interface AuthContextType {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginAction(email, password);
    if (!result.success) throw new Error(result.error);
    const data = result.data!;
    storeAuthData(data);
    setUser(data);
    router.push(data.role?.toLowerCase() === 'merchant' ? '/dashboard/merchant' : '/dashboard/employee');
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
