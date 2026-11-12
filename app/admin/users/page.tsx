'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { 
  Loader2, Store, Search, User, Mail, Phone, MapPin, 
  ShieldCheck, Calendar, Clock, Star, AlertTriangle, 
  CreditCard, CheckCircle2, X, Globe, ShieldAlert
} from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const supabase = createBrowserSupabase();
    
    // Fetch users with their related listings, reviews, and payments counts
    const { data } = await supabase
      .from('users')
      .select(`
        *,
        listings(count),
        reviews(count),
        payments(count)
      `)
      .order('created_at', { ascending: false });
      
    setUsers(data || []);
    setLoading(false);
  }

  async function makeSeller(userId: string) {
    if (!confirm('Manually upgrade this user to an active seller for 1 year?')) return;
    setActionLoading(userId);
    const supabase = createBrowserSupabase();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await supabase.from('users').update({
      role: 'seller',
      seller_status: 'active',
      seller_expires_at: expiresAt.toISOString(),
      verification_level: 'phone'
    }).eq('id', userId);
    
    await fetchUsers();
    setSelectedUser(null);
    setActionLoading(null);
  }

  async function toggleBan(userId: string, currentStatus: string) {
    setActionLoading(userId);
    const supabase = createBrowserSupabase();
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    await supabase.from('users').update({ account_status: newStatus }).eq('id', userId);
    await fetchUsers();
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, account_status: newStatus });
    }
    setActionLoading(null);
  }

  // Filter users based on search
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.seller_code || '').toLowerCase().includes(query) ||
      (u.phone || '').includes(query)
    );
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-foreground">Users & Sellers</h1>
        
        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      
      {/* USERS TABLE */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Seller Code</th>
                <th className="px-6 py-4 font-semibold">Role & Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20 cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{u.seller_code}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-primary/10 text-primary' :
                      u.role === 'seller' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                    {u.account_status === 'banned' && <span className="ml-2 text-xs text-red-500 font-bold">BANNED</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">
                      View Full Profile
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL USER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedUser(null)}>
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-background border border-border p-6 md:p-8 glass-card animate-slide-up-menu"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedUser.name}</h2>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-secondary rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Identity */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Identity</h3>
                <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /> <span>ID: <span className="font-mono text-xs">{selectedUser.id}</span></span></div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /> <span>Phone: {selectedUser.phone || '—'}</span></div>
                <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-muted-foreground" /> <span>Country: {selectedUser.country}</span></div>
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /> <span>Timezone: {selectedUser.timezone}</span></div>
                <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> <span>Auth: {selectedUser.auth_method}</span></div>
                <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-muted-foreground" /> <span>Code: <span className="font-mono font-bold text-primary">{selectedUser.seller_code}</span></span></div>
              </div>

              {/* Status & Permissions */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</h3>
                <div className="flex items-center gap-3"><ShieldAlert className="h-4 w-4 text-muted-foreground" /> <span>Account: {selectedUser.account_status || 'active'}</span></div>
                <div className="flex items-center gap-3"><Store className="h-4 w-4 text-muted-foreground" /> <span>Role: {selectedUser.role}</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-muted-foreground" /> <span>Verification: {selectedUser.verification_level}</span></div>
                {selectedUser.role === 'seller' && (
                  <>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>Seller Status: {selectedUser.seller_status}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>Expires: {selectedUser.seller_expires_at ? formatDate(selectedUser.seller_expires_at) : '—'}</span></div>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Activity</h3>
                <div className="flex items-center gap-3"><Star className="h-4 w-4 text-muted-foreground" /> <span>Rating: {selectedUser.rating_avg} ({selectedUser.rating_count} reviews)</span></div>
                <div className="flex items-center gap-3"><Store className="h-4 w-4 text-muted-foreground" /> <span>Listings: {selectedUser.listings?.[0]?.count || 0}</span></div>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>Joined: {formatDate(selectedUser.created_at)}</span></div>
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /> <span>Last Active: {formatDate(selectedUser.last_active_at)}</span></div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Preferences</h3>
                <pre className="text-xs bg-secondary/50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedUser.notification_preferences, null, 2)}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-3">
              {selectedUser.role === 'buyer' && (
                <button onClick={() => makeSeller(selectedUser.id)} disabled={actionLoading === selectedUser.id} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2">
                  {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />} Upgrade to Seller
                </button>
              )}
              <button onClick={() => toggleBan(selectedUser.id, selectedUser.account_status)} disabled={actionLoading === selectedUser.id} className={`flex-1 rounded-xl py-3 text-sm font-semibold border flex items-center justify-center gap-2 ${
                selectedUser.account_status === 'banned' ? 'border-green-500 text-green-500 hover:bg-green-500/10' : 'border-red-500 text-red-500 hover:bg-red-500/10'
              }`}>
                {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                {selectedUser.account_status === 'banned' ? 'Unban User' : 'Ban User'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}