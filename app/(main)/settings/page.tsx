import { redirect } from 'next/navigation';
import { SettingsView } from '@/src/features/profile/components/SettingsView';
import { getActiveProfile } from '@/src/features/profile/services/profile.service';

export default async function SettingsPage() {
  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/login');
  }

  return <SettingsView profile={profile} />;
}
