'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchApi } from '@/src/features/common/http';
import { normalizeLocale } from '@/src/features/common/config';
import type { Profile, UpdateProfileSettingsInput } from '../domain/profile';

export async function getActiveProfile(): Promise<Profile | null> {
  try {
    const profile = await fetchApi<Profile>('/api/profile/me');
    return profile || null;
  } catch {
    return null;
  }
}

export async function getProfile(_userId: string): Promise<Profile | null> {
  return getActiveProfile();
}

export async function updateProfileRegion(region: string) {
  try {
    await fetchApi('/api/profile/region', {
      method: 'PATCH',
      body: JSON.stringify({ region }),
    });

    const cookieStore = await cookies();
    cookieStore.set('user_region', region, {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile region:', error);
    throw error;
  }
}

export async function updateProfileRegionFormAction(formData: FormData): Promise<void> {
  const newRegion = formData.get('region') as string;
  await updateProfileRegion(newRegion);
}

export async function updateProfileSettings({
  language,
  maturityRating,
  isKids,
}: UpdateProfileSettingsInput) {
  try {
    const fields: UpdateProfileSettingsInput = {};
    if (language !== undefined) fields.language = normalizeLocale(language);
    if (maturityRating !== undefined) fields.maturityRating = maturityRating;
    if (isKids !== undefined) fields.isKids = isKids;

    await fetchApi('/api/profile/settings', {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating profile settings:', error);
    throw error;
  }
}

export async function saveSettingsFormAction(formData: FormData): Promise<void> {
  const language = formData.get('language') as string;
  const maturityRating = formData.get('maturity_rating') as string;
  const isKids = formData.get('is_kids') === 'on';

  await updateProfileSettings({
    language,
    maturityRating,
    isKids,
  });

  revalidatePath('/settings');
  revalidatePath('/profile');
  redirect('/profile');
}
