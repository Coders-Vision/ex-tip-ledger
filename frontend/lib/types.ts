// User roles - matching backend
export type UserRole = 'merchant' | 'Employee';

// Auth
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  merchantId?: string;
  employeeId?: string;
}

// Merchant tip summary
export interface TipStatusSummary {
  count: number;
  totalAmount: number;
}

export interface MerchantTipSummary {
  merchantId: string;
  pending: TipStatusSummary;
  confirmed: TipStatusSummary;
  reversed: TipStatusSummary;
  netTotal: number;
}

// Employee ledger
export interface LedgerEntry {
  id: string;
  amount: string; // API returns as string e.g. "2.500"
  type: 'CREDIT' | 'DEBIT';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tipIntentId: string;
  employeeId: string;
}

export interface EmployeeTips {
  employeeId: string;
  entries: LedgerEntry[];
  totalAmount: number;
}
