// app/admin/layout.tsx
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { LayoutDashboard, Users, Settings, FileText, AlertTriangle } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // This ensures only admins can see this layout
  await requireAdmin();
  
  const navItems = [
    { href: '/admin', label: 'Approval Queue', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users & Sellers', icon: Users },
    { href: '/admin/moderation', label: 'Moderation', icon: AlertTriangle },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/system', label: 'System Settings', icon: Settings },
  ];
  
  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-64 border-r border-border bg-background p-4">
        <div className="mb-8 px-4">
          <h2 className="text-lg font-bold">PrimeMart Admin</h2>
        </div>
        <nav className="space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}