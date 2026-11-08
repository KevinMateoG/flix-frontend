import { redirect } from 'next/navigation';
import { getUser } from '@/src/features/auth/services/auth.service';
import { AdminView } from '@/src/features/admin/components/AdminView';

export default async function AdminPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/home');
  }

  return <AdminView user={user} />;
}