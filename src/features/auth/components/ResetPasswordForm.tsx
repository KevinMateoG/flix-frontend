'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/src/features/common/components/Button';
import { useAuth } from '../hooks/useAuth';

export function ResetPasswordForm() {
  const { resetPassword, loading, error } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword({ password, confirmPassword });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute top-1/3 left-1/3 h-125 w-125 rounded-full blur-[120px]" />
      </div>

      <div className="bg-surface relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
        <div className="bg-surface-container hidden flex-col items-start justify-between p-12 md:flex md:w-5/12">
          <Link href="/home" className="text-display-lg text-primary font-bold tracking-tighter">
            FLIX
          </Link>
          <div>
            <h2 className="text-headline-md text-on-background mb-3 font-semibold">
              Set a new password.
            </h2>
            <p className="text-body-sm text-muted">
              Choose a strong password to keep your account secure.
            </p>
          </div>
          <p className="text-label-caps text-muted">© 2026 Flix. All rights reserved.</p>
        </div>

        <div className="w-full p-8 md:w-7/12 md:p-12">
          <div className="mb-8 text-center md:text-left">
            <Link
              href="/home"
              className="text-display-lg text-primary font-bold tracking-tighter md:hidden"
            >
              FLIX
            </Link>
            <h2 className="text-headline-sm text-on-background mb-1 hidden font-semibold md:block">
              Set a new password
            </h2>
            <p className="text-body-sm text-muted mt-2">
              Enter and confirm your new password below.
            </p>
          </div>

          {error && (
            <div className="bg-error/10 text-body-sm text-error border-error/20 mb-4 rounded border p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-label-caps text-on-surface">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
                className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-label-caps text-on-surface">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
              />
            </div>

            <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
              {loading ? 'Updating password...' : 'Update Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-body-sm text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
