'use client';

import { useState } from 'react';
import { updateProfileRegion } from '../services/profile.service';

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
