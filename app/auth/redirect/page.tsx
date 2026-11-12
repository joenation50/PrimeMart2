import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AuthRedirectPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const role = session.profile.role;

  if (role === 'admin') {
    redirect('/admin');
  } 
  
  if (role === 'seller') {
    if (session.profile.seller_status === 'unpaid' || session.profile.seller_status === 'pending') {
      redirect('/paywall');
    }
    redirect('/dashboard');
  }

  redirect('/buyer');
}