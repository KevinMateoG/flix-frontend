import Link from 'next/link';
import { Settings, CreditCard, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/features/common/components/Button';
import { signOutAction } from '@/src/features/auth/services/auth.service';
import type { AuthUser } from '@/src/features/auth/domain/auth';
import { REGIONS, type Profile } from '../domain/profile';
import { updateProfileRegionFormAction } from '../services/profile.service';
import { ProfileAvatarEditor } from './ProfileAvatarEditor';

interface ProfileViewProps {
  user: AuthUser;
  profile: Profile | null;
}

export function ProfileView({ user, profile }: ProfileViewProps) {
  const displayName =
    profile?.displayName || profile?.display_name || user.email?.split('@')[0] || 'User';
  const plan = profile?.plan || 'free';
  const region = profile?.region || 'US';
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url || user.image || null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-6 md:px-12 md:py-10">
      <h1 className="text-display-lg-mobile md:text-display-lg text-on-background mb-8">Profile</h1>

      <div className="bg-surface-container mb-8 flex flex-col justify-between gap-6 rounded-lg p-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProfileAvatarEditor initialAvatarUrl={avatarUrl} displayName={displayName} />
          <div className="flex flex-col gap-1 sm:border-l sm:border-white/10 sm:pl-6">
            <h2 className="text-headline-sm text-on-background font-semibold">{displayName}</h2>
            <p className="text-body-sm text-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="bg-primary/20 text-label-caps text-primary inline-flex items-center rounded px-2 py-1 uppercase">
                {plan} Plan
              </span>
              {user.role === 'admin' && (
                <span className="border-primary/40 bg-primary/10 text-label-caps text-primary inline-flex items-center rounded border px-2 py-1 uppercase">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-label-caps text-muted mb-2">Account Settings</h3>

        {user.role === 'admin' && (
          <Link
            href="/admin"
            className="bg-surface-container hover:bg-surface-bright border-primary/30 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
          >
            <div className="flex items-center gap-4">
              <ShieldCheck size={20} className="text-primary" />
              <span className="text-body-lg text-on-background font-medium">Admin Dashboard</span>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </Link>
        )}

        <Link
          href="/settings"
          className="bg-surface-container hover:bg-surface-bright flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors"
        >
          <div className="flex items-center gap-4">
            <Settings size={20} className="text-muted" />
            <span className="text-body-lg text-on-background">App Preferences</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </Link>

        <button className="bg-surface-container hover:bg-surface-bright flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors">
          <div className="flex items-center gap-4">
            <CreditCard size={20} className="text-muted" />
            <span className="text-body-lg text-on-background">Billing Details</span>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>

        <h3 className="text-label-caps text-muted mt-6 mb-2">Region Settings</h3>
        <form
          action={updateProfileRegionFormAction}
          className="bg-surface-container border-surface-bright/20 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
        >
          <div className="flex flex-col gap-1">
            <span className="text-body-lg text-on-background">Watch Region</span>
            <p className="text-muted text-xs">
              Filters TMDB content availability and regional stream providers.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select
              name="region"
              defaultValue={region}
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-surface focus:border-primary h-10 w-full cursor-pointer rounded border px-3 focus:outline-none sm:w-40"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>

        <form action={signOutAction} className="mt-8">
          <Button
            type="submit"
            variant="secondary"
            className="text-error hover:bg-error/10 hover:text-error border-error/20 w-full gap-2 md:w-auto md:self-start"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
