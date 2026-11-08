import { redirect } from 'next/navigation';
import { getUser } from '@/src/features/auth/services/auth.service';
import { ProfileView } from '@/src/features/profile/components/ProfileView';
import { getProfile } from '@/src/features/profile/services/profile.service';

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile(user.id);

  return <ProfileView user={user} profile={profile} />;
}
