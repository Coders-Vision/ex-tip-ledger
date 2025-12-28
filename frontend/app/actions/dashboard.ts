'use server';

import type { MerchantTipSummary, EmployeeTips } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function serverFetch<T>(
  endpoint: string,
  token?: string
): Promise<ActionResult<T>> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, error: json.message || 'Request failed' };
    }

    // API wraps response in { status, data, message, timestamp }
    const data = json.data ?? json;
    return { success: true, data };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function getMerchantTipSummaryAction(
  merchantId: string,
  token: string
): Promise<ActionResult<MerchantTipSummary>> {
  return serverFetch<MerchantTipSummary>(`/merchants/${merchantId}/tips/summary`, token);
}

export async function getEmployeeTipsAction(
  employeeId: string,
  token: string
): Promise<ActionResult<EmployeeTips>> {
  return serverFetch<EmployeeTips>(`/employees/${employeeId}/tips`, token);
}
