'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserRole } from '@/src/features/auth/domain/auth';
import type {
  AdminUserRecord,
  EntityStatusFilter,
  PaginationMeta,
  UpdateAdminUserInput,
} from '../domain/admin';
import { deleteAdminUser, getAdminUsers, updateAdminUser } from '../services/admin.service';
import type { AdminFeedback } from './useAdminCatalog';

export function useAdminUsers(initialLimit = 8) {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    currentPage: 1,
    limit: initialLimit,
    totalPages: 1,
  });
  const [page, setPageState] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState<'all' | UserRole>('all');
  const [status, setStatus] = useState<EntityStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev !== search) {
          setIsLoading(true);
          setPageState(1);
        }
        return search;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminUsers({
        page,
        limit: initialLimit,
        search: debouncedSearch,
        role,
        status,
      });
      setUsers(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [page, initialLimit, debouncedSearch, role, status]);

  useEffect(() => {
    let active = true;
    async function fetchInitialOrFilteredUsers() {
      try {
        const response = await getAdminUsers({
          page,
          limit: initialLimit,
          search: debouncedSearch,
          role,
          status,
        });
        if (active) {
          setUsers(response.data);
          setPagination(response.pagination);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load users.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void fetchInitialOrFilteredUsers();
    return () => {
      active = false;
    };
  }, [page, initialLimit, debouncedSearch, role, status]);

  const setPage = useCallback((nextPage: number | ((prev: number) => number)) => {
    setIsLoading(true);
    setPageState(nextPage);
  }, []);

  const handleRoleChange = useCallback((nextRole: 'all' | UserRole) => {
    setIsLoading(true);
    setRole(nextRole);
    setPageState(1);
  }, []);

  const handleStatusChange = useCallback((nextStatus: EntityStatusFilter) => {
    setIsLoading(true);
    setStatus(nextStatus);
    setPageState(1);
  }, []);

  const resetFilters = useCallback(() => {
    setIsLoading(true);
    setSearch('');
    setDebouncedSearch('');
    setRole('all');
    setStatus('all');
    setPageState(1);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleUpdateUser = useCallback(
    async (userId: string, input: UpdateAdminUserInput): Promise<boolean> => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        const updated = await updateAdminUser(userId, input);
        setFeedback({
          type: 'success',
          message: `Account ${updated.email} updated.`,
        });
        await loadUsers();
        return true;
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not update user account.',
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadUsers],
  );

  const handleDeleteUser = useCallback(
    async (userId: string, userEmail: string): Promise<boolean> => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        await deleteAdminUser(userId);
        setFeedback({
          type: 'success',
          message: `Account ${userEmail} deactivated (logical deletion).`,
        });
        await loadUsers();
        return true;
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Could not deactivate user account.',
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadUsers],
  );

  const handleRestoreUser = useCallback(
    async (userId: string): Promise<boolean> => {
      return handleUpdateUser(userId, { isActive: true });
    },
    [handleUpdateUser],
  );

  return {
    users,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    role,
    setRole: handleRoleChange,
    status,
    setStatus: handleStatusChange,
    isLoading,
    error,
    isSubmitting,
    feedback,
    clearFeedback,
    reload: loadUsers,
    resetFilters,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    restoreUser: handleRestoreUser,
  };
}
