'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getStoredToken } from '@/lib/api';
import { getEmployeeTipsAction } from '@/app/actions/dashboard';
import type { EmployeeTips } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, LogOut } from 'lucide-react';

const formatKWD = (n: number) =>
  new Intl.NumberFormat('en-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(n);

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s));

export default function EmployeeDashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<EmployeeTips | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Fetch data once when user is available
  useEffect(() => {
    if (authLoading || !user?.employeeId) return;
    const token = getStoredToken();
    if (!token) return;
    
    getEmployeeTipsAction(user.employeeId, token)
      .then((result) => {
        if (result.success && result.data) {
          setTips(result.data);
        } else {
          toast.error(result.error || 'Failed to load data');
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user?.employeeId]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const credits = tips?.entries.filter((e) => e.type === 'CREDIT') || [];
  const debits = tips?.entries.filter((e) => e.type === 'DEBIT') || [];
  const totalCredits = credits.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalDebits = debits.reduce((sum, e) => sum + parseFloat(e.amount), 0);

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
        <h1 className="mb-6 text-3xl font-bold">Employee Dashboard</h1>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-green-50 border-green-200 dark:bg-green-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatKWD(tips?.totalAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">{tips?.entries.length || 0} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatKWD(totalCredits)}</div>
              <p className="text-xs text-muted-foreground">{credits.length} tips</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200 dark:bg-red-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatKWD(totalDebits)}</div>
              <p className="text-xs text-muted-foreground">{debits.length} reversals</p>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ledger Entries</CardTitle>
            <CardDescription>Your tip transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            {!tips?.entries.length ? (
              <p className="py-8 text-center text-muted-foreground">No transactions yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.createdAt)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          entry.type === 'CREDIT'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {entry.type === 'CREDIT' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                          {entry.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{entry.notes || '-'}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        entry.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.type === 'CREDIT' ? '+' : '-'}{formatKWD(parseFloat(entry.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
