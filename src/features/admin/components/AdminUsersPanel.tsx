'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import type { UserRole } from '@/src/features/auth/domain/auth';
import { Button } from '@/src/features/common/components/Button';
import { cn } from '@/src/features/common/config';
import { LANGUAGES, MATURITY_RATINGS, REGIONS } from '@/src/features/profile/domain/profile';
import {
  SUBSCRIPTION_PLANS,
  type AdminUserRecord,
  type EntityStatusFilter,
} from '../domain/admin';
import { useAdminUsers } from '../hooks/useAdminUsers';

interface AdminUsersPanelProps {
  currentAdminId: string;
}

export function AdminUsersPanel({ currentAdminId }: AdminUsersPanelProps) {
  const {
    users,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    isLoading,
    error,
    isSubmitting,
    feedback,
    clearFeedback,
    reload,
    resetFilters,
    updateUser,
    deleteUser,
    restoreUser,
  } = useAdminUsers(8);

  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(null);

  const [formName, setFormName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('user');
  const [formRegion, setFormRegion] = useState('US');
  const [formPlan, setFormPlan] = useState('free');
  const [formLanguage, setFormLanguage] = useState('en-US');
  const [formMaturity, setFormMaturity] = useState('TV-MA');
  const [formIsKids, setFormIsKids] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (deletingUser && !isSubmitting) {
          setDeletingUser(null);
        } else if (editingUser && !isSubmitting) {
          setEditingUser(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deletingUser, editingUser, isSubmitting]);

  const openEditUserModal = (target: AdminUserRecord) => {
    setEditingUser(target);
    setFormName(target.name);
    setFormDisplayName(target.displayName || target.name);
    setFormEmail(target.email);
    setFormRole(target.role);
    setFormRegion(target.region || 'US');
    setFormPlan(target.plan || 'free');
    setFormLanguage(target.language || 'en-US');
    setFormMaturity(target.maturityRating || 'TV-MA');
    setFormIsKids(target.isKids);
    setFormIsActive(target.isActive);
    setFormError(null);
    clearFeedback();
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;
    setFormError(null);

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim().toLowerCase();
    const trimmedDisplay = formDisplayName.trim() || trimmedName;

    if (!trimmedName) {
      setFormError('User name cannot be empty.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Enter a valid email address.');
      return;
    }

    const ok = await updateUser(editingUser.id, {
      name: trimmedName,
      displayName: trimmedDisplay,
      email: trimmedEmail,
      role: formRole,
      region: formRegion,
      plan: formPlan,
      language: formLanguage,
      maturityRating: formMaturity,
      isKids: formIsKids,
      isActive: formIsActive,
    });

    if (ok) {
      setEditingUser(null);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    const ok = await deleteUser(deletingUser.id, deletingUser.email);
    if (ok) {
      setDeletingUser(null);
    }
  };

  const hasActiveFilters = search.trim().length > 0 || role !== 'all' || status !== 'all';

  return (
    <section aria-labelledby="users-management-heading" className="flex flex-col gap-6">
      <div className="bg-surface-container border-surface-bright/30 flex flex-col gap-4 rounded-lg border p-4 sm:p-6">
        <div>
          <h2
            id="users-management-heading"
            className="text-headline-sm text-on-background font-semibold"
          >
            Users and Administrators Directory
          </h2>
          <p className="text-body-sm text-muted mt-1">
            Modify account details, assign admin or standard user roles, update regional profile
            settings, or logically deactivate accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search
              size={18}
              className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, or ID..."
              aria-label="Search users by name or email"
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-background placeholder:text-muted focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border pr-4 pl-10 focus-visible:ring-1 focus-visible:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-users-role-filter" className="sr-only">
              Filter by role
            </label>
            <select
              id="admin-users-role-filter"
              value={role}
              onChange={(e) => setRole(e.target.value as 'all' | UserRole)}
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary focus-visible:ring-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="all">Role: All Accounts</option>
              <option value="admin">Role: Administrators</option>
              <option value="user">Role: Standard Users</option>
            </select>
          </div>

          <div>
            <label htmlFor="admin-users-status-filter" className="sr-only">
              Filter by account status
            </label>
            <select
              id="admin-users-status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value as EntityStatusFilter)}
              className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary focus-visible:ring-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="all">Status: All Users</option>
              <option value="active">Status: Active Only</option>
              <option value="inactive">Status: Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={cn(
            'flex items-center justify-between gap-4 rounded-lg border px-4 py-3',
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
              : 'border-error/40 bg-error-container/30 text-error',
          )}
        >
          <span className="text-body-sm font-medium">{feedback.message}</span>
          <button
            type="button"
            onClick={clearFeedback}
            aria-label="Dismiss notification"
            className="hover:bg-surface-bright/40 focus-visible:ring-primary flex h-9 w-9 items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-surface-container border-surface-bright/30 flex flex-col gap-4 rounded-lg border p-6"
        >
          <p className="text-body-sm text-muted">Loading user accounts and profiles...</p>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="bg-surface-container-high h-16 w-full animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="bg-surface-container border-error/40 flex flex-col items-start justify-between gap-4 rounded-lg border p-6 sm:flex-row sm:items-center"
        >
          <div>
            <h3 className="text-headline-sm text-error font-semibold">Failed to load users</h3>
            <p className="text-body-sm text-on-background mt-1">{error}</p>
          </div>
          <Button type="button" onClick={() => void reload()} className="min-h-11">
            Retry Loading Users
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-surface-container border-surface-bright/30 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
          <div className="bg-surface-container-high text-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Users size={24} />
          </div>
          <h3 className="text-headline-sm text-on-background font-semibold">
            {hasActiveFilters
              ? 'No user accounts match your current filters'
              : 'No user accounts found'}
          </h3>
          <p className="text-body-sm text-muted mt-2 mb-6 max-w-md">
            {hasActiveFilters
              ? 'Reset the search query, role filter, or status filter to view all registered users.'
              : 'Registered users will appear here once accounts are created or seeded.'}
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="secondary"
              onClick={resetFilters}
              className="min-h-11"
            >
              Reset User Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (lg+) */}
          <div className="bg-surface-container border-surface-bright/30 hidden overflow-x-auto rounded-lg border lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-surface-bright/30 bg-surface-container-high/60 border-b">
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">
                    User & Email
                  </th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">Role</th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">
                    Profile Preferences
                  </th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-label-caps text-muted whitespace-nowrap px-4 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-surface-bright/20 divide-y">
                {users.map((item) => {
                  const isSelf = item.id === currentAdminId;
                  const initials = (item.displayName || item.name || item.email || 'U')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'hover:bg-surface-container-high/40 transition-colors',
                        !item.isActive && 'opacity-70',
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="bg-surface-container-high border-surface-bright/40 text-on-background flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-bold">
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.displayName || item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-body-sm text-on-background truncate font-semibold">
                                {item.displayName || item.name}
                              </span>
                              {isSelf && (
                                <span className="bg-surface-container-high border-surface-bright/40 text-muted rounded border px-1.5 py-0.5 text-xs">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-muted truncate text-xs">{item.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {item.role === 'admin' ? (
                          <span className="border-primary/40 bg-primary/15 text-on-background inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold">
                            <ShieldCheck size={13} className="text-primary" />
                            Admin
                          </span>
                        ) : (
                          <span className="bg-surface-container-high border-surface-bright/40 text-on-background inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium">
                            <UserIcon size={13} className="text-muted" />
                            User
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="bg-surface-container-high text-on-background rounded px-2 py-0.5 font-medium">
                            Region: {item.region || 'US'}
                          </span>
                          <span className="bg-surface-container-high text-on-background rounded px-2 py-0.5 uppercase">
                            {item.plan || 'free'}
                          </span>
                          <span className="bg-surface-container-high text-muted rounded px-2 py-0.5">
                            {item.maturityRating || 'TV-MA'}
                          </span>
                          {item.isKids && (
                            <span className="bg-surface-container-high text-on-background rounded px-2 py-0.5 font-semibold">
                              Kids
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                            <Check size={12} />
                            Active
                          </span>
                        ) : (
                          <span className="border-error/40 bg-error-container/30 text-error inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold">
                            <X size={12} />
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditUserModal(item)}
                            disabled={isSubmitting}
                            className="min-h-10 gap-1.5 whitespace-nowrap px-3"
                          >
                            <Pencil size={14} />
                            Edit
                          </Button>

                          {item.isActive ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setDeletingUser(item)}
                              disabled={isSubmitting || isSelf}
                              title={
                                isSelf
                                  ? 'You cannot deactivate your own active admin account'
                                  : 'Logically deactivate user account'
                              }
                              className="border-error/30 text-error hover:bg-error/10 min-h-10 gap-1.5 whitespace-nowrap px-3"
                            >
                              <Trash2 size={14} />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => void restoreUser(item.id)}
                              disabled={isSubmitting}
                              className="min-h-10 gap-1.5 whitespace-nowrap border-emerald-500/30 px-3 text-emerald-300 hover:bg-emerald-950/40"
                            >
                              <RotateCcw size={14} />
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Reflow Cards (< lg) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {users.map((item) => {
              const isSelf = item.id === currentAdminId;
              const initials = (item.displayName || item.name || item.email || 'U')
                .slice(0, 2)
                .toUpperCase();

              return (
                <article
                  key={item.id}
                  className={cn(
                    'bg-surface-container border-surface-bright/30 flex flex-col justify-between gap-4 rounded-lg border p-4',
                    !item.isActive && 'opacity-75',
                  )}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-surface-container-high border-surface-bright/40 text-on-background flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-bold">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.displayName || item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-body-lg text-on-background truncate font-semibold">
                            {item.displayName || item.name}
                          </h3>
                          <p className="text-muted truncate text-xs">{item.email}</p>
                        </div>
                      </div>

                      {item.isActive ? (
                        <span className="inline-flex shrink-0 items-center rounded border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="border-error/40 bg-error-container/30 text-error inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-semibold">
                          Deactivated
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="border-primary/40 bg-primary/15 text-on-background rounded border px-2 py-0.5 font-semibold uppercase">
                        Role: {item.role}
                      </span>
                      <span className="bg-surface-container-high text-on-background rounded px-2 py-0.5">
                        Region: {item.region || 'US'}
                      </span>
                      <span className="bg-surface-container-high text-on-background rounded px-2 py-0.5 uppercase">
                        Plan: {item.plan || 'free'}
                      </span>
                      <span className="bg-surface-container-high text-muted rounded px-2 py-0.5">
                        {item.maturityRating || 'TV-MA'}
                      </span>
                    </div>
                  </div>

                  <div className="border-surface-bright/20 flex items-center gap-2 border-t pt-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditUserModal(item)}
                      disabled={isSubmitting}
                      className="min-h-11 flex-1 gap-1.5"
                    >
                      <Pencil size={15} />
                      Edit
                    </Button>
                    {item.isActive ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeletingUser(item)}
                        disabled={isSubmitting || isSelf}
                        className="border-error/30 text-error hover:bg-error/10 min-h-11 flex-1 gap-1.5"
                      >
                        <Trash2 size={15} />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => void restoreUser(item.id)}
                        disabled={isSubmitting}
                        className="min-h-11 flex-1 gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40"
                      >
                        <RotateCcw size={15} />
                        Restore
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="bg-surface-container border-surface-bright/30 flex flex-col items-center justify-between gap-4 rounded-lg border px-4 py-3 sm:flex-row">
            <p className="text-body-sm text-muted">
              Showing page{' '}
              <span className="text-on-background font-semibold">{pagination.currentPage}</span> of{' '}
              <span className="text-on-background font-semibold">{pagination.totalPages}</span> (
              <span className="text-on-background font-semibold">{pagination.total}</span> total
              users)
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="min-h-11 gap-1 px-3"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="min-h-11 gap-1 px-3"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-user-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-surface-container border-surface-bright/40 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-lg border p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 id="edit-user-modal-title" className="text-headline-sm text-on-background font-bold">
                Edit User Account ({editingUser.email})
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="text-muted hover:text-on-background focus-visible:ring-primary flex h-11 w-11 items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-user-name"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    Account Name
                  </label>
                  <input
                    id="edit-user-name"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border px-3.5 focus-visible:ring-1 focus-visible:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-user-display-name"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    Profile Display Name
                  </label>
                  <input
                    id="edit-user-display-name"
                    type="text"
                    required
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border px-3.5 focus-visible:ring-1 focus-visible:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-user-email"
                  className="text-body-sm text-on-background font-semibold"
                >
                  Email Address
                </label>
                <input
                  id="edit-user-email"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary focus-visible:ring-primary h-11 w-full rounded border px-3.5 focus-visible:ring-1 focus-visible:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-user-role"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    System Role
                  </label>
                  <select
                    id="edit-user-role"
                    value={formRole}
                    disabled={editingUser.id === currentAdminId}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary h-11 w-full cursor-pointer rounded border px-3 disabled:opacity-60 focus-visible:outline-none"
                  >
                    <option value="user">Standard User (user)</option>
                    <option value="admin">Administrator (admin)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-user-region"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    Watch Region
                  </label>
                  <select
                    id="edit-user-region"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:outline-none"
                  >
                    {REGIONS.map((reg) => (
                      <option key={reg.code} value={reg.code}>
                        {reg.name} ({reg.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-user-plan"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    Subscription Plan
                  </label>
                  <select
                    id="edit-user-plan"
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:outline-none"
                  >
                    {SUBSCRIPTION_PLANS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-user-language"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    Preferred Language
                  </label>
                  <select
                    id="edit-user-language"
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:outline-none"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-user-maturity"
                    className="text-body-sm text-on-background font-semibold"
                  >
                    Maturity Rating
                  </label>
                  <select
                    id="edit-user-maturity"
                    value={formMaturity}
                    onChange={(e) => setFormMaturity(e.target.value)}
                    className="border-surface-bright bg-surface-container-high text-body-sm text-on-background focus-visible:border-primary h-11 w-full cursor-pointer rounded border px-3 focus-visible:outline-none"
                  >
                    {MATURITY_RATINGS.map((rating) => (
                      <option key={rating.code} value={rating.code}>
                        {rating.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-surface-container-high border-surface-bright/30 flex items-center justify-between rounded border p-3.5">
                <div>
                  <span className="text-body-sm text-on-background block font-semibold">
                    Kids Profile Mode
                  </span>
                  <span className="text-muted text-xs">
                    Restricts catalog visibility to child-safe maturity ratings.
                  </span>
                </div>
                <input
                  type="checkbox"
                  aria-label="Kids profile mode"
                  checked={formIsKids}
                  onChange={(e) => setFormIsKids(e.target.checked)}
                  className="accent-primary h-5 w-5 cursor-pointer"
                />
              </div>

              <div className="bg-surface-container-high border-surface-bright/30 flex items-center justify-between rounded border p-3.5">
                <div>
                  <span className="text-body-sm text-on-background block font-semibold">
                    Account Active Status
                  </span>
                  <span className="text-muted text-xs">
                    Unchecking logically deactivates the user and revokes active sessions.
                  </span>
                </div>
                <input
                  type="checkbox"
                  aria-label="Account active status"
                  disabled={editingUser.id === currentAdminId}
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="accent-primary h-5 w-5 cursor-pointer disabled:opacity-50"
                />
              </div>

              {formError && (
                <p role="alert" className="text-error text-body-sm font-medium">
                  {formError}
                </p>
              )}

              <div className="mt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={isSubmitting}
                  className="min-h-11"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-h-11">
                  {isSubmitting ? 'Saving...' : 'Save Account Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logical Deletion Confirmation Dialog */}
      {deletingUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-user-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="bg-surface-container border-surface-bright/40 w-full max-w-md rounded-lg border p-6 shadow-2xl">
            <h3
              id="delete-user-modal-title"
              className="text-headline-sm text-on-background font-bold"
            >
              Deactivate User Account
            </h3>
            <p className="text-body-sm text-muted mt-3">
              Are you sure you want to logically deactivate{' '}
              <span className="text-on-background font-semibold">{deletingUser.email}</span>? Their
              active sessions will be revoked immediately and <code className="text-primary">isActive</code> will be set to <code className="text-primary">false</code>.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeletingUser(null)}
                disabled={isSubmitting}
                className="min-h-11"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirmDeleteUser()}
                disabled={isSubmitting}
                className="min-h-11"
              >
                {isSubmitting ? 'Deactivating...' : 'Confirm Logical Deactivation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
