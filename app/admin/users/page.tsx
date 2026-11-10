import { createServerSupabase } from '@/lib/supabase';
import { UserTable } from '@/features/admin/userTable';

export default async function UsersPage() {
  const supabase = await createServerSupabase();
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Users & Sellers</h1>
      <UserTable users={users || []} />
    </div>
  );
}