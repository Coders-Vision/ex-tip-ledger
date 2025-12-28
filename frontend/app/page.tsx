'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(user.role?.toLowerCase() === 'merchant' ? '/dashboard/merchant' : '/dashboard/employee');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold">💰 Tip Ledger</span>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Digital Tip Tracking
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>
        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
          Track tips, manage employees, and maintain a complete ledger of all transactions.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <div className="mb-2 text-3xl">📊</div>
            <h3 className="mb-2 font-semibold">Merchant Dashboard</h3>
            <p className="text-sm text-muted-foreground">View tip totals by status</p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-2 text-3xl">📒</div>
            <h3 className="mb-2 font-semibold">Employee Ledger</h3>
            <p className="text-sm text-muted-foreground">Complete transaction history</p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-2 text-3xl">🔒</div>
            <h3 className="mb-2 font-semibold">Secure & Reliable</h3>
            <p className="text-sm text-muted-foreground">Immutable audit trail</p>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2025 Tip Ledger
      </footer>
    </div>
  );
}
