'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  uploadProfileAvatarClient,
  validateAvatarFile,
} from '@/src/features/profile/services/avatar.service';
import { authClient } from '../services/auth-client';
import type { LoginInput, RegisterInput, ResetPasswordInput } from '../domain/auth';

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    authClient
      .getSession()
      .then((res: { data?: { user?: unknown } | null } | null) => {
        if (active && res?.data?.user) {
          router.replace('/home');
        }
      })
      .catch(() => {
        // Ignore session check errors when unauthenticated or offline
      });
    return () => {
      active = false;
    };
  }, [router]);

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

    router.replace('/home');
    router.refresh();
  };

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/home`,
    });
  };

  const register = async ({
    name,
    email,
    password,
    confirmPassword,
    avatarFile,
  }: RegisterInput) => {
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

    if (avatarFile) {
      const avatarValidationError = validateAvatarFile(avatarFile);
      if (avatarValidationError) {
        setError(avatarValidationError);
        setLoading(false);
        return;
      }
    }

    const { error: authError } = await authClient.signUp.email({
      email: email.trim(),
      password,
      name: name.trim(),
    });

    if (authError) {
      setError(authError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    if (avatarFile) {
      try {
        await uploadProfileAvatarClient(avatarFile);
      } catch (uploadErr) {
        console.error('Error uploading profile avatar after registration:', uploadErr);
      }
    }

    router.replace('/home');
    router.refresh();
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
    router.replace('/login');
    router.refresh();
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
