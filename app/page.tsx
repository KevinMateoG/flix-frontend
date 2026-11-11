import { redirect } from 'next/navigation';
import { getUser } from '@/src/features/auth/services/auth.service';

export default async function RootPage() {
  const user = await getUser();
  redirect(user ? '/home' : '/login');
}
