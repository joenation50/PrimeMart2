'use client';

import { useState } from 'react';
import { Bell, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendNotification } from './actions';

export default function AdminSendNotificationPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    target: 'all' as 'all' | 'specific',
    email: '',
    title: '',
    body: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const result = await sendNotification(form);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setForm({ ...form, title: '', body: '', email: '' }); // clear form
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" /> Send Notification
      </h1>

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
          <label className="block text-sm font-medium mb-2">Who is this for?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="target" 
                value="all" 
                checked={form.target === 'all'} 
                onChange={() => setForm({ ...form, target: 'all' })} 
              />
              <span className="text-sm">Everyone (Broadcast)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="target" 
                value="specific" 
                checked={form.target === 'specific'} 
                onChange={() => setForm({ ...form, target: 'specific' })} 
              />
              <span className="text-sm">Specific User</span>
            </label>
          </div>
        </div>

        {/* Email Input (Only shows if 'specific' is selected) */}
        {form.target === 'specific' && (
          <div>
            <label className="block text-sm font-medium mb-2">User's Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="buyer@example.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
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

        {/* Body */}
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
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
}