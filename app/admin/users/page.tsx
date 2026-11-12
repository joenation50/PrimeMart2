'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, Store, CheckCircle2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const supabase = createBrowserSupabase();
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function makeSeller(userId: string, name: string) {
    if (!confirm(`Make ${name} an active seller?`)) return;
    
    const supabase = createBrowserSupabase();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Update the user
    const { error } = await supabase.from('users').update({
      role: 'seller',
      seller_status: 'active',
      seller_expires_at: expiresAt.toISOString()
    }).eq('id', userId);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setSuccessMsg(`${name} is now an active seller!`);
      fetchUsers(); // Refresh the list
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-foreground">Users & Sellers</h1>

      {successMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500 font-medium">
          <CheckCircle2 className="h-5 w-5" /> {successMsg}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'seller' ? 'bg-blue-500/10 text-blue-500' :
                      u.role === 'admin' ? 'bg-primary/10 text-primary' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role === 'buyer' && (
                      <button 
                        onClick={() => makeSeller(u.id, u.name)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 inline-flex items-center gap-1"
                      >
                        <Store className="h-3 w-3" /> Make Seller
                      </button>
                    )}
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