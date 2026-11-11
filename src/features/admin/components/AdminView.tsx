import Link from 'next/link';
import { ShieldCheck, Film, ArrowLeft } from 'lucide-react';
import type { AuthUser } from '@/src/features/auth/domain/auth';

interface AdminViewProps {
  user: AuthUser;
}

export function AdminView({ user }: AdminViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 md:px-12 md:py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-headline-md text-on-background font-bold">
              Admin Dashboard
            </h1>
            <p className="text-body-sm text-muted">
              Sesión activa como administrador ({user.email})
            </p>
          </div>
        </div>

        <Link
          href="/home"
          className="bg-surface-container hover:bg-surface-bright text-body-sm text-on-background inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </div>

      <div className="bg-surface-container border-surface-bright/20 rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-2">
          <Film size={20} className="text-primary" />
          <h2 className="text-headline-sm text-on-background font-semibold">
            Gestión de Catálogo Reproducible (Playable Content)
          </h2>
        </div>
        <p className="text-body-sm text-muted">
          Vista exclusiva para el rol <code className="text-primary font-semibold">admin</code>.
          Los usuarios con rol <code className="text-on-background">user</code> son redirigidos automáticamente.
        </p>
      </div>
    </div>
  );
}