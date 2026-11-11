'use client';

import { useRef } from 'react';
import { Camera, Loader2, Trash2, User } from 'lucide-react';
import { useProfileAvatar } from '../hooks/useProfile';

interface ProfileAvatarEditorProps {
  initialAvatarUrl?: string | null;
  displayName: string;
}

export function ProfileAvatarEditor({
  initialAvatarUrl,
  displayName,
}: ProfileAvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { avatarUrl, uploading, deleting, error, uploadAvatar, removeAvatar } =
    useProfileAvatar(initialAvatarUrl);

  const isCustomAvatar = Boolean(
    avatarUrl && !avatarUrl.endsWith('/static/default-avatar.svg'),
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadAvatar(file);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-4">
        <div className="bg-surface-bright border-surface-bright/40 relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Foto de perfil de ${displayName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={40} className="text-on-surface" />
          )}

          {(uploading || deleting) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Seleccionar foto de perfil"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
              className="bg-surface-container-high hover:bg-surface-bright border-surface-bright text-on-surface inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Camera size={14} />
              {uploading ? 'Subiendo...' : isCustomAvatar ? 'Cambiar foto' : 'Subir foto'}
            </button>

            {isCustomAvatar && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploading || deleting}
                className="border-error/30 text-error hover:bg-error/10 inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                title="Eliminar foto de perfil"
              >
                <Trash2 size={14} />
                {deleting ? 'Eliminando...' : 'Quitar'}
              </button>
            )}
          </div>

          <span className="text-muted text-[11px]">JPEG, PNG o WebP · Máx. 2 MB</span>
        </div>
      </div>

      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
