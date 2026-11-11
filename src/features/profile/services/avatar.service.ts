import { fetchClientApi } from '@/src/features/common/http';
import type { Profile } from '../domain/profile';

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function validateAvatarFile(file: File): string | null {
  if (
    !ALLOWED_AVATAR_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number],
    )
  ) {
    return 'La foto de perfil debe ser una imagen JPEG, PNG o WebP.';
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return 'La foto de perfil no puede superar los 2 MB.';
  }

  return null;
}

export async function uploadProfileAvatarClient(file: File): Promise<Profile> {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('avatar', file);

  return fetchClientApi<Profile>('/api/profile/avatar', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteProfileAvatarClient(): Promise<Profile> {
  return fetchClientApi<Profile>('/api/profile/avatar', {
    method: 'DELETE',
  });
}
