import { requireAdmin } from '@/lib/auth';
import { headers } from 'next/headers';
import { AdminSidebar } from '@/features/admin/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';

  // 1. Skip layout for the login page (Fixes the redirect loop)
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // 2. Require admin auth for everything else
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar email={session.profile.email || 'Admin'} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}