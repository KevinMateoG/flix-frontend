'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileRegion } from '../services/profile.service';
import {
  deleteProfileAvatarClient,
  uploadProfileAvatarClient,
} from '../services/avatar.service';

export function useProfileRegion(initialRegion = 'US') {
  const [region, setRegion] = useState(initialRegion);
  const [saving, setSaving] = useState(false);

  const saveRegion = async (nextRegion: string) => {
    setSaving(true);
    try {
      await updateProfileRegion(nextRegion);
      setRegion(nextRegion);
    } finally {
      setSaving(false);
    }
  };

  return {
    region,
    setRegion,
    saving,
    saveRegion,
  };
}

export function useProfileAvatar(initialAvatarUrl?: string | null) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const updated = await uploadProfileAvatarClient(file);
      setAvatarUrl(updated.avatarUrl || updated.avatar_url || null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la foto de perfil.');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    setDeleting(true);
    setError(null);
    try {
      const updated = await deleteProfileAvatarClient();
      setAvatarUrl(updated.avatarUrl || updated.avatar_url || null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la foto de perfil.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    avatarUrl,
    uploading,
    deleting,
    error,
    uploadAvatar,
    removeAvatar,
  };
}
