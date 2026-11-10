// features/account/AccountPage.tsx
import { requireAuth } from '@/lib/auth';
import { AccountView } from './account-view';

export async function AccountPage() {
  const session = await requireAuth();
  return <AccountView user={session.profile} />;
}