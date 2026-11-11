import Link from 'next/link';
import { Film, Home, Compass, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export function NotFoundView() {
  return (
    <main className="bg-background text-on-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center md:px-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-[130px]" />
        <div className="bg-surface-bright/20 absolute bottom-10 left-1/4 h-64 w-64 rounded-full blur-[100px]" />
      </div>

      <div className="bg-surface-container/80 border-surface-bright/30 relative z-10 flex w-full max-w-xl flex-col items-center rounded-2xl border p-8 shadow-2xl backdrop-blur-md md:p-12">
        <div className="bg-primary/15 border-primary/30 text-primary mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border">
          <Film size={32} aria-hidden="true" />
        </div>

        <span className="text-label-caps text-primary tracking-widest">Error 404</span>

        <h1 className="text-display-lg-mobile md:text-display-lg text-on-background mt-2 font-bold">
          Esta escena no está en el corte final
        </h1>

        <p className="text-body-lg text-muted mt-4 max-w-md">
          La página o el título que buscas fue movido, eliminado o no existe en esta dirección.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/home" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2">
              <Home size={18} />
              Ir al inicio
            </Button>
          </Link>
          <Link href="/browse" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full gap-2">
              <Compass size={18} />
              Explorar catálogo
            </Button>
          </Link>
        </div>

        <Link
          href="/"
          className="text-body-sm text-muted hover:text-on-background mt-6 inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a la página de presentación
        </Link>
      </div>
    </main>
  );
}
