'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, Loader2, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { sendNotification } from './actions';
import { createBrowserSupabase } from '@/lib/supabase-browser';

export default function AdminSendNotificationPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    target: 'all' as 'all' | 'specific',
    userId: '',
    title: '',
    body: '',
  });

  // Fetch all users from Supabase on load
  useEffect(() => {
    async function loadUsers() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name', { ascending: true });
      
      setUsers(data || []);
      setFetchingUsers(false);
    }
    loadUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.target === 'specific' && !form.userId) {
      setError('Please select a user from the dropdown.');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError('');

    const result = await sendNotification(form);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setForm({ ...form, title: '', body: '', userId: '' }); // clear form
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Send Notification</h1>
          <p className="text-sm text-muted-foreground">Send an alert to a specific user or everyone.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-500">
          <CheckCircle2 className="h-5 w-5" /> Notification sent successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-6">
        
        {/* Target Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Who is this for?</label>
          <div className="flex gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-secondary/50 px-4 py-3 rounded-xl border border-border hover:border-primary transition-colors">
              <input 
                type="radio" 
                name="target" 
                value="all" 
                checked={form.target === 'all'} 
                onChange={() => setForm({ ...form, target: 'all' })} 
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Everyone (Broadcast)</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-secondary/50 px-4 py-3 rounded-xl border border-border hover:border-primary transition-colors">
              <input 
                type="radio" 
                name="target" 
                value="specific" 
                checked={form.target === 'specific'} 
                onChange={() => setForm({ ...form, target: 'specific' })} 
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Specific User</span>
            </label>
          </div>
        </div>

        {/* Specific User Dropdown */}
        {form.target === 'specific' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" /> Select User
            </label>
            {fetchingUsers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
              </div>
            ) : (
              <select
                required
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="" disabled>Select a user from the database...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || 'Unnamed'} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Weekend Sale! 🎉"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Message Body */}
        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Type your message here..."
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (form.target === 'specific' && fetchingUsers)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
}