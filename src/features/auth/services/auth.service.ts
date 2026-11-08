'use server';

import { redirect } from 'next/navigation';
import { fetchApi } from '@/src/features/common/http';
import type { AuthSession, AuthUser } from '../domain/auth';

export async function getUser(): Promise<AuthUser | null> {
  try {
    const data = await fetchApi<AuthSession>('/api/auth/get-session');
    return data?.user || null;
  } catch {
    return null;
  }
}

export async function signOutAction(): Promise<void> {
  try {
    await fetchApi('/api/auth/sign-out', { method: 'POST' });
  } catch {
    // ignore sign-out error and redirect to login
  }
  redirect('/login');
}
