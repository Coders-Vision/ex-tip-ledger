'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getStoredToken } from '@/lib/api';
import { getMerchantTipSummaryAction } from '@/app/actions/dashboard';
import type { MerchantTipSummary } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, DollarSign, LogOut } from 'lucide-react';

const formatKWD = (n: number) => 
  new Intl.NumberFormat('en-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(n);

export default function MerchantDashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<MerchantTipSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Fetch data once when user is available
  useEffect(() => {
    if (authLoading || !user?.merchantId) return;
    const token = getStoredToken();
    if (!token) return;
    
    getMerchantTipSummaryAction(user.merchantId, token)
      .then((result) => {
        if (result.success && result.data) {
          setSummary(result.data);
        } else {
          toast.error(result.error || 'Failed to load data');
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user?.merchantId]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const total = (summary?.pending.count || 0) + (summary?.confirmed.count || 0) + (summary?.reversed.count || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold">💰 Tip Ledger</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">Merchant Dashboard</h1>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-green-50 border-green-200 dark:bg-green-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatKWD(summary?.netTotal || 0)}</div>
              <p className="text-xs text-muted-foreground">Confirmed - Reversed</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.pending.count || 0}</div>
              <p className="text-xs text-muted-foreground">{formatKWD(summary?.pending.totalAmount || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.confirmed.count || 0}</div>
              <p className="text-xs text-muted-foreground">{formatKWD(summary?.confirmed.totalAmount || 0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200 dark:bg-red-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reversed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.reversed.count || 0}</div>
              <p className="text-xs text-muted-foreground">{formatKWD(summary?.reversed.totalAmount || 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tip Summary</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Pending</span>
                <span className="text-muted-foreground">{summary?.pending.count || 0} tips</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: total ? `${((summary?.pending.count || 0) / total) * 100}%` : '0%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Confirmed</span>
                <span className="text-muted-foreground">{summary?.confirmed.count || 0} tips</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: total ? `${((summary?.confirmed.count || 0) / total) * 100}%` : '0%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Reversed</span>
                <span className="text-muted-foreground">{summary?.reversed.count || 0} tips</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: total ? `${((summary?.reversed.count || 0) / total) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between font-medium">
              <span>Total Tips</span>
              <span>{total}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
