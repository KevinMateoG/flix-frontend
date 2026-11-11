import { redirect } from 'next/navigation';
import { LoginForm } from '@/src/features/auth/components/LoginForm';
import { getUser } from '@/src/features/auth/services/auth.service';

export default async function LoginPage() {
  const user = await getUser();
  if (user) {
    redirect('/home');
  }

  return <LoginForm />;
}
