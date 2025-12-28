import type { AuthResponse } from './types';

// Storage helpers
export const getStoredUser = (): AuthResponse | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const storeAuthData = (data: AuthResponse) => {
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
