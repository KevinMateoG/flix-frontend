'use client';

import { useSearchParams } from 'next/navigation';

export function useHomeDemoMode(): boolean {
  const searchParams = useSearchParams();
  return searchParams.get('demoMode') === 'all';
}
