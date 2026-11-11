'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Camera, User, X } from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import { validateAvatarFile } from '@/src/features/profile/services/avatar.service';
import { useAuth } from '../hooks/useAuth';

export function RegisterForm() {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      e.target.value = '';
      return;
    }

    setAvatarError(null);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ name, email, password, confirmPassword, avatarFile });
  };

  const displayedError = avatarError || error;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute top-1/4 right-1/4 h-150 w-150 rounded-full blur-[120px]" />
        <div className="bg-primary/5 absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full blur-[80px]" />
      </div>

      <div className="bg-surface relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
        <div className="bg-surface-container hidden flex-col items-start justify-between p-12 md:flex md:w-5/12">
          <Link href="/login" className="text-display-lg text-primary font-bold tracking-tighter">
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
              href="/login"
              className="text-display-lg text-primary font-bold tracking-tighter md:hidden"
            >
              FLIX
            </Link>
            <h2 className="text-headline-sm text-on-background mb-1 hidden font-semibold md:block">
              Create your account
            </h2>
            <p className="text-body-sm text-muted mt-2">Join Flix today, it&apos;s free.</p>
          </div>

          {displayedError && (
            <div className="bg-error/10 text-body-sm text-error border-error/20 mb-4 rounded border p-3">
              {displayedError}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Profile Photo Upload Field */}
            <div className="border-surface-bright/40 bg-surface-container/60 flex items-center gap-4 rounded-lg border p-3">
              <div className="bg-surface-bright border-surface-bright relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                {avatarPreviewUrl ? (
                  <img
                    src={avatarPreviewUrl}
                    alt="Vista previa de foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={28} className="text-muted" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label
                  htmlFor="avatar"
                  className="text-label-caps text-on-surface cursor-pointer"
                >
                  Profile Photo (Optional)
                </label>
                <p className="text-muted truncate text-xs">
                  {avatarFile ? avatarFile.name : 'JPEG, PNG or WebP · Max 2 MB'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-surface-bright/60 hover:bg-surface-bright text-on-surface inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors"
                  >
                    <Camera size={13} />
                    {avatarFile ? 'Change photo' : 'Upload photo'}
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="text-muted hover:text-error inline-flex items-center gap-1 text-xs transition-colors"
                    >
                      <X size={13} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

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
