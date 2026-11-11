// app/admin/layout.tsx
import { requireAdmin } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { LayoutDashboard, Users, Settings, FileText, AlertTriangle } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';

  // 1. If we are on the login page, just render the page without the sidebar or auth check
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // 2. For all other admin pages, require auth and show the sidebar
  await requireAdmin();

  const navItems = [
    { href: '/admin', label: 'Approval Queue', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users & Sellers', icon: Users },
    { href: '/admin/moderation', label: 'Moderation', icon: AlertTriangle },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/system', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border glass-card p-4 hidden md:block">
        <div className="mb-8 px-4 pt-4">
          <h2 className="text-lg font-bold tracking-tight">PrimeMart Admin</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}