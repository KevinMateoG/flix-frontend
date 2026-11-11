import { redirect } from 'next/navigation';
import { RegisterForm } from '@/src/features/auth/components/RegisterForm';
import { getUser } from '@/src/features/auth/services/auth.service';

export default async function RegisterPage() {
  const user = await getUser();
  if (user) {
    redirect('/home');
  }

  return <RegisterForm />;
}
