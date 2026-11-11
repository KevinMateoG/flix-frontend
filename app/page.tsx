import { getUser } from '@/src/features/auth/services/auth.service';
import { LandingView } from '@/src/features/home/components/LandingView';

export default async function RootPage() {
  const user = await getUser();

  return <LandingView isAuthenticated={Boolean(user)} />;
}

