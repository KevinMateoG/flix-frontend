'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { cn } from '@/src/features/common/config';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '@/src/features/common/hooks/useLanguage';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);

interface HeaderProps {
  className?: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}

export function Header({ className, avatarUrl, isAdmin = false }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isDemoMode = searchParams.get('demoMode') === 'all';
  const getHref = (path: string) => (isDemoMode ? `${path}?demoMode=all` : path);

  const toggleDemoMode = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isDemoMode) {
      params.delete('demoMode');
    } else {
      params.set('demoMode', 'all');
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  };

  useGSAP(
    () => {
      const hideAnim = gsap.to(headerRef.current, {
        yPercent: -100,
        paused: true,
        duration: 0.3,
        ease: 'power2.inOut',
      });

      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          if (self.scroll() > 50) {
            if (self.direction === 1) {
              hideAnim.play();
            } else {
              hideAnim.reverse();
            }
          } else {
            hideAnim.reverse();
          }
        },
      });
    },
    { scope: headerRef },
  );

  return (
    <header
      ref={headerRef}
      className={cn(
        'bg-background/80 sticky top-0 z-50 flex h-16 items-center justify-between px-4 backdrop-blur-md md:px-12',
        className,
      )}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="text-headline-md text-primary font-bold tracking-tighter">
          FLIX
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={getHref('/home')}
            className="text-body-sm text-muted hover:text-on-background font-medium transition-colors"
          >
            {t('home')}
          </Link>
          <Link
            href={getHref('/browse')}
            className="text-body-sm text-muted hover:text-on-background font-medium transition-colors"
          >
            {t('browse')}
          </Link>
          <Link
            href={getHref('/my-list')}
            className="text-body-sm text-muted hover:text-on-background font-medium transition-colors"
          >
            {t('myList')}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'text-body-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'text-primary font-semibold'
                  : 'text-muted hover:text-on-background',
              )}
            >
              {t('admin')}
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDemoMode}
          className={cn(
            'hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:flex',
            isDemoMode
              ? 'bg-primary text-on-primary border-primary hover:bg-primary/90'
              : 'bg-surface-container text-muted border-surface-bright hover:text-on-background',
          )}
        >
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isDemoMode ? 'bg-on-primary animate-pulse' : 'bg-muted',
            )}
          />
          {isDemoMode ? 'Demo: ON' : 'Restricted: ON'}
        </button>

        <Link href="/search" className="text-on-background hover:text-primary transition-colors">
          <Search size={20} />
          <span className="sr-only">{t('search')}</span>
        </Link>
        <Link
          href="/profile"
          className="bg-surface-container hover:bg-surface-bright border-surface-bright/40 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border transition-colors"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={t('profile')} className="h-full w-full object-cover" />
          ) : (
            <User size={16} className="text-on-surface" />
          )}
          <span className="sr-only">{t('profile')}</span>
        </Link>
      </div>
    </header>
  );
}
