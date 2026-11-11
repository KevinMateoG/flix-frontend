'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/src/features/common/components/Button';
import { useAuth } from '../hooks/useAuth';

export function RegisterForm() {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ name, email, password, confirmPassword });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute top-1/4 right-1/4 h-150 w-150 rounded-full blur-[120px]" />
        <div className="bg-primary/5 absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full blur-[80px]" />
      </div>

      <div className="bg-surface relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
        <div className="bg-surface-container hidden flex-col items-start justify-between p-12 md:flex md:w-5/12">
          <Link href="/home" className="text-display-lg text-primary font-bold tracking-tighter">
            FLIX
          </Link>
          <div>
            <h2 className="text-headline-md text-on-background mb-3 font-semibold">
              Join the experience.
            </h2>
            <p className="text-body-sm text-muted">
              Create your free account and start streaming thousands of films from around the world.
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
              Create your account
            </h2>
            <p className="text-body-sm text-muted mt-2">Join Flix today, it&apos;s free.</p>
          </div>

          {error && (
            <div className="bg-error/10 text-body-sm text-error border-error/20 mb-4 rounded border p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-label-caps text-on-surface">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-label-caps text-on-surface">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-label-caps text-on-surface">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-surface-bright bg-surface-container text-body-sm text-on-surface focus:border-primary h-12 w-full rounded border px-4 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-label-caps text-on-surface">
                Confirm Password
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-body-sm text-muted mt-6 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
