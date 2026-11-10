'use client';
import { formatDate } from '@/lib/format';

export function UserTable({ users }: { users: any[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Code</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-muted/30">
              <td className="px-6 py-4">
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </td>
              <td className="px-6 py-4 font-mono text-xs">{u.seller_code}</td>
              <td className="px-6 py-4 capitalize">{u.role}</td>
              <td className="px-6 py-4">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  u.account_status === 'active' ? 'bg-green-100 text-green-700' :
                  u.account_status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {u.account_status}
                </span>
              </td>
              <td className="px-6 py-4 text-muted-foreground">{formatDate(u.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}