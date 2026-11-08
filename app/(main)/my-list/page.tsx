import { redirect } from 'next/navigation';
import { getTmdbLanguage } from '@/src/features/common/config';
import { MyListView } from '@/src/features/library/components/MyListView';
import { getDetailedMyList } from '@/src/features/library/services/library.service';
import { getActiveProfile } from '@/src/features/profile/services/profile.service';

export default async function MyListPage() {
  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/login');
  }
  const language = getTmdbLanguage(profile.language);
  const items = await getDetailedMyList(profile.id, language);

  return <MyListView items={items} />;
}
