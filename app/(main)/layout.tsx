import { Suspense } from 'react';
import { Header } from '@/src/features/common/components/Header';
import { BottomNav } from '@/src/features/common/components/BottomNav';
import { LanguageProvider } from '@/src/features/common/components/LanguageProvider';
import { getActiveProfile } from '@/src/features/profile/services/profile.service';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await getActiveProfile();
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url || null;

  return (
    <LanguageProvider locale={profile?.language}>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <Header avatarUrl={avatarUrl} />
        </Suspense>
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </div>
    </LanguageProvider>
  );
}
