'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Store, ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const supabase = createBrowserSupabase();
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function toggleBan(userId: string, currentStatus: string) {
    const supabase = createBrowserSupabase();
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    await supabase.from('users').update({ account_status: newStatus }).eq('id', userId);
    fetchUsers();
  }

  // NEW: Manually upgrade a user to seller
  async function makeSeller(userId: string) {
    if (!confirm('Are you sure you want to manually upgrade this user to an Active Seller?')) return;
    
    const supabase = createBrowserSupabase();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await supabase.from('users').update({
      role: 'seller',
      seller_status: 'active',
      seller_expires_at: expiresAt.toISOString()
    }).eq('id', userId);
    
    fetchUsers();
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Users & Sellers</h1>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {u.role} 
                    {u.role === 'seller' && <span className="ml-2 text-xs text-muted-foreground">({u.seller_status})</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.account_status === 'banned' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {u.account_status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    
                    {/* NEW: Make Seller Button */}
                    {u.role === 'buyer' && (
                      <button 
                        onClick={() => makeSeller(u.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1"
                      >
                        <Store className="h-3 w-3" /> Make Seller
                      </button>
                    )}

                    <button 
                      onClick={() => toggleBan(u.id, u.account_status || 'active')}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                        u.account_status === 'banned' 
                          ? 'border-green-500/30 text-green-500 hover:bg-green-500/10' 
                          : 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                      }`}
                    >
                      {u.account_status === 'banned' ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}