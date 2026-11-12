'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Approval Queue', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users & Sellers', icon: Users },
    { href: '/admin/moderation', label: 'Moderation', icon: AlertTriangle },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/system', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/10 glass-card p-4 hidden md:flex flex-col h-screen sticky top-0">
      <div className="mb-10 px-4 pt-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground">Admin Panel</h2>
        </div>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-white/10">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground">
          Back to Marketplace
        </Link>
      </div>
    </aside>
  );
}