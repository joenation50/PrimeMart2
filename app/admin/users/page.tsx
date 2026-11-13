'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { 
  Loader2, Store, Search, User, Mail, Phone, MapPin, 
  ShieldCheck, Calendar, Clock, Star, AlertTriangle, 
  CreditCard, CheckCircle2, X, Globe, ShieldAlert,
  ExternalLink, Shield, UserMinus
} from 'lucide-react';
import { formatDate } from '@/lib/format';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const supabase = createBrowserSupabase();
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *, 
        seller_profiles(business_name, logo_url),
        listings(id, title, category)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Database Error:", error);
      setError(error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  // --- ACTIONS ---
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

  async function demoteToBuyer(userId: string) {
    if (!confirm('Demote this user back to a Buyer? They will lose their store and seller status.')) return;
    setActionLoading(userId);
    const supabase = createBrowserSupabase();

    await supabase.from('users').update({
      role: 'buyer',
      seller_status: null,
      seller_expires_at: null
    }).eq('id', userId);
    
    await fetchUsers();
    setSelectedUser(null);
    setActionLoading(null);
  }

  async function extendSubscription(userId: string, currentExpiry: string) {
    setActionLoading(userId);
    const supabase = createBrowserSupabase();
    const baseDate = currentExpiry ? new Date(currentExpiry) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 1);

    await supabase.from('users').update({
      seller_expires_at: baseDate.toISOString(),
      seller_status: 'active'
    }).eq('id', userId);
    
    await fetchUsers();
    if (selectedUser) setSelectedUser({ ...selectedUser, seller_expires_at: baseDate.toISOString() });
    setActionLoading(null);
  }

  async function toggleBan(userId: string, currentStatus: string) {
    setActionLoading(userId);
    const supabase = createBrowserSupabase();
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    await supabase.from('users').update({ account_status: newStatus }).eq('id', userId);
    await fetchUsers();
    if (selectedUser) setSelectedUser({ ...selectedUser, account_status: newStatus });
    setActionLoading(null);
  }

  async function toggleVerification(userId: string, currentLevel: string) {
    setActionLoading(userId);
    const supabase = createBrowserSupabase();
    const newLevel = currentLevel === 'verified' ? 'unverified' : 'verified';
    await supabase.from('users').update({ verification_level: newLevel }).eq('id', userId);
    await fetchUsers();
    if (selectedUser) setSelectedUser({ ...selectedUser, verification_level: newLevel });
    setActionLoading(null);
  }

  // --- UNIVERSAL SEARCH LOGIC ---
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    
    const matchesUser = 
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.seller_code || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q);
      
    const matchesStore = (u.seller_profiles?.business_name || '').toLowerCase().includes(q);
    
    const matchesListings = u.listings?.some((l: any) => 
      (l.title || '').toLowerCase().includes(q) || 
      (l.category || '').toLowerCase().includes(q)
    );

    return matchesUser || matchesStore || matchesListings;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Sellers</h1>
          <p className="text-sm text-muted-foreground">Search by user, store, product, or category.</p>
        </div>
        
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
          <p className="font-bold">Database Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Role & Status</th>
                <th className="px-6 py-4 font-semibold">Expiry</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => {
                // FIXED: Only look for logo_url from the seller_profiles table
                const avatar = u.seller_profiles?.logo_url;
                
                return (
                  <tr key={u.id} className="hover:bg-secondary/20 cursor-pointer" onClick={() => setSelectedUser(u)}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                         {avatar ? (
                           <Image src={avatar} alt="Avatar" fill className="object-cover" />
                         ) : (
                           <span className="font-bold text-muted-foreground">{u.name?.charAt(0).toUpperCase()}</span>
                         )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-1">
                          {u.name}
                          {u.verification_level === 'verified' && <ShieldCheck className="h-3 w-3 text-primary" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
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
                    <td className="px-6 py-4 text-xs">
                      {u.seller_expires_at ? formatDate(u.seller_expires_at) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
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
            <div className="flex justify-between items-start mb-6 border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden border-2 border-primary/20">
                  {selectedUser.seller_profiles?.logo_url ? (
                    <Image src={selectedUser.seller_profiles.logo_url} alt="Avatar" fill className="object-cover" />
                  ) : (
                    selectedUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.verification_level === 'verified' && <ShieldCheck className="h-5 w-5 text-primary" />}
                  </h2>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-secondary rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Identity</h3>
                <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /> <span>ID: <span className="font-mono text-xs">{selectedUser.id}</span></span></div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /> <span>Phone: {selectedUser.phone || '—'}</span></div>
                <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-muted-foreground" /> <span>Country: {selectedUser.country}</span></div>
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /> <span>Timezone: {selectedUser.timezone}</span></div>
                <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> <span>Auth: {selectedUser.auth_method}</span></div>
                <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-muted-foreground" /> <span>Code: <span className="font-mono font-bold text-primary">{selectedUser.seller_code}</span></span></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</h3>
                <div className="flex items-center gap-3"><ShieldAlert className="h-4 w-4 text-muted-foreground" /> <span className="capitalize">Account: {selectedUser.account_status || 'active'}</span></div>
                <div className="flex items-center gap-3"><Store className="h-4 w-4 text-muted-foreground" /> <span className="capitalize">Role: {selectedUser.role}</span></div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${selectedUser.verification_level === 'verified' ? 'text-primary' : 'text-muted-foreground'}`} /> 
                  <span className="capitalize">Verification: {selectedUser.verification_level}</span>
                </div>
                {selectedUser.role === 'seller' && (
                  <>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /> <span className="capitalize">Seller Status: {selectedUser.seller_status}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>Expires: {selectedUser.seller_expires_at ? formatDate(selectedUser.seller_expires_at) : '—'}</span></div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Activity</h3>
                <div className="flex items-center gap-3"><Star className="h-4 w-4 text-muted-foreground" /> <span>Rating: {selectedUser.rating_avg || 0} ({selectedUser.rating_count || 0} reviews)</span></div>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>Joined: {formatDate(selectedUser.created_at)}</span></div>
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /> <span>Last Active: {formatDate(selectedUser.last_active_at)}</span></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Preferences</h3>
                <pre className="text-xs bg-secondary/50 p-3 rounded-lg overflow-x-auto max-h-32">
                  {JSON.stringify(selectedUser.notification_preferences || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-3">
              <div className="flex flex-wrap gap-3">
                {selectedUser.role === 'seller' && (
                  <Link href={`/store/${selectedUser.store_slug || selectedUser.seller_code}`} target="_blank" className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-secondary flex items-center justify-center gap-2">
                    <ExternalLink className="h-4 w-4" /> View Public Store
                  </Link>
                )}

                <button onClick={() => toggleVerification(selectedUser.id, selectedUser.verification_level)} disabled={actionLoading === selectedUser.id} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-secondary flex items-center justify-center gap-2">
                  {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} 
                  {selectedUser.verification_level === 'verified' ? 'Remove Verification' : 'Verify User'}
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedUser.role === 'buyer' ? (
                  <button onClick={() => makeSeller(selectedUser.id)} disabled={actionLoading === selectedUser.id} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2">
                    {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />} Upgrade to Seller
                  </button>
                ) : (
                  <button onClick={() => demoteToBuyer(selectedUser.id)} disabled={actionLoading === selectedUser.id} className="flex-1 rounded-xl border border-orange-500 text-orange-500 hover:bg-orange-500/10 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                    {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />} Demote to Buyer
                  </button>
                )}

                {selectedUser.role === 'seller' && (
                  <button onClick={() => extendSubscription(selectedUser.id, selectedUser.seller_expires_at)} disabled={actionLoading === selectedUser.id} className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold hover:bg-secondary flex items-center justify-center gap-2">
                    {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} +1 Year Subscription
                  </button>
                )}
              </div>

              <button onClick={() => toggleBan(selectedUser.id, selectedUser.account_status)} disabled={actionLoading === selectedUser.id} className={`w-full rounded-xl py-3 text-sm font-semibold border flex items-center justify-center gap-2 ${
                selectedUser.account_status === 'banned' ? 'border-green-500 text-green-500 hover:bg-green-500/10' : 'border-red-500 text-red-500 hover:bg-red-500/10'
              }`}>
                {actionLoading === selectedUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                {selectedUser.account_status === 'banned' ? 'Unban User' : 'Ban / Suspend User'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}