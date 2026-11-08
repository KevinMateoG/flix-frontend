'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../services/auth-client';
import type { LoginInput, RegisterInput, ResetPasswordInput } from '../domain/auth';

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const login = async ({ email, password }: LoginInput) => {
    setLoading(true);
    setError(null);

    const { error: authError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    router.push('/home');
  };

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/home`,
    });
  };

  const register = async ({ name, email, password, confirmPassword }: RegisterInput) => {
    setLoading(true);
    setError(null);

    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { error: authError } = await authClient.signUp.email({
      email,
      password,
      name: name.trim(),
    });

    if (authError) {
      setError(authError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    router.push('/home');
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const clientWithForget = authClient as unknown as {
      forgetPassword: (opts: { email: string; redirectTo: string }) => Promise<{
        error?: { message?: string } | null;
      }>;
    };

    const { error: authError } = await clientWithForget.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError(authError.message || 'An error occurred');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const resetPassword = async ({ password, confirmPassword }: ResetPasswordInput) => {
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { error: authError } = await authClient.resetPassword({ newPassword: password });

    if (authError) {
      setError(authError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    await authClient.signOut();
    router.push('/home');
  };

  return {
    loading,
    error,
    success,
    login,
    loginWithGoogle,
    register,
    forgotPassword,
    resetPassword,
  };
}
