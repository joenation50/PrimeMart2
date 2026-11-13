'use client';

import { useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ReportModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    type: 'General Issue',
    details: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createBrowserSupabase();
    
    // Insert into the reports table
    const { error: dbError } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type: 'general', // Distinguishes this from listing reports
      target_id: user.id, // Using user ID as a placeholder since target_id is required
      reason: form.type,
      details: form.details,
      status: 'pending'
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-3xl bg-background border border-border p-6 md:p-8 glass-card animate-slide-up-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Report an Issue</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Report Submitted</h3>
            <p className="text-sm text-muted-foreground mb-6">Our admin team will review this shortly. Thank you for helping keep PrimeMart safe.</p>
            <button onClick={onClose} className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">What is this regarding?</label>
              <select 
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="General Issue">General Issue</option>
                <option value="Payment Problem">Payment Problem</option>
                <option value="Bug / App Error">Bug / App Error</option>
                <option value="Account Issue">Account Issue</option>
                <option value="Report a User">Report a User</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Details</label>
              <textarea 
                required
                rows={4}
                value={form.details}
                onChange={(e) => setForm({...form, details: e.target.value})}
                placeholder="Please describe the issue in detail..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}