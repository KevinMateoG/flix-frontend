'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Film, ShieldCheck, Users } from 'lucide-react';
import type { AuthUser } from '@/src/features/auth/domain/auth';
import { cn } from '@/src/features/common/config';
import { AdminCatalogPanel } from './AdminCatalogPanel';
import { AdminUsersPanel } from './AdminUsersPanel';

interface AdminViewProps {
  user: AuthUser;
}

type AdminWorkspaceTab = 'catalog' | 'users';

export function AdminView({ user }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>('catalog');

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-12 md:py-10">
      <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-display-lg-mobile md:text-headline-md text-on-background font-bold">
              Admin Management Console
            </h1>
            <p className="text-body-sm text-muted">
              Authenticated as <span className="text-on-background font-medium">{user.email}</span>{' '}
              (Role: <code className="text-primary font-semibold">admin</code>)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/profile"
            className="bg-surface-container hover:bg-surface-bright text-body-sm text-on-background focus-visible:ring-primary inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Profile
          </Link>
          <Link
            href="/home"
            className="bg-surface-container hover:bg-surface-bright text-body-sm text-on-background focus-visible:ring-primary inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeft size={16} />
            Back to Catalog
          </Link>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Admin management sections"
        className="bg-surface-container border-surface-bright/30 flex flex-col gap-2 rounded-lg border p-1.5 sm:flex-row"
      >
        <button
          type="button"
          role="tab"
          id="tab-catalog"
          aria-selected={activeTab === 'catalog'}
          aria-controls="panel-catalog"
          onClick={() => setActiveTab('catalog')}
          className={cn(
            'focus-visible:ring-primary flex min-h-11 flex-1 items-center justify-center gap-2.5 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none',
            activeTab === 'catalog'
              ? 'bg-primary text-on-primary'
              : 'text-muted hover:bg-surface-container-high hover:text-on-background',
          )}
        >
          <Film size={18} />
          Playable Movies Library
        </button>

        <button
          type="button"
          role="tab"
          id="tab-users"
          aria-selected={activeTab === 'users'}
          aria-controls="panel-users"
          onClick={() => setActiveTab('users')}
          className={cn(
            'focus-visible:ring-primary flex min-h-11 flex-1 items-center justify-center gap-2.5 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none',
            activeTab === 'users'
              ? 'bg-primary text-on-primary'
              : 'text-muted hover:bg-surface-container-high hover:text-on-background',
          )}
        >
          <Users size={18} />
          Users and Roles Management
        </button>
      </div>

      <div
        id="panel-catalog"
        role="tabpanel"
        aria-labelledby="tab-catalog"
        hidden={activeTab !== 'catalog'}
      >
        {activeTab === 'catalog' && <AdminCatalogPanel />}
      </div>

      <div
        id="panel-users"
        role="tabpanel"
        aria-labelledby="tab-users"
        hidden={activeTab !== 'users'}
      >
        {activeTab === 'users' && <AdminUsersPanel currentAdminId={user.id} />}
      </div>
    </div>
  );
}
