'use server';

import type { AuthResponse } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface AuthResult {
  success: boolean;
  data?: AuthResponse;
  error?: string;
}

export async function loginAction(email: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      return { success: false, error: json.message || 'Login failed' };
    }

    // API wraps response in { status, data, message, timestamp }
    const data = json.data || json;
    return { success: true, data };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}
