'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { Loader2, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

export default function ModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setReports(data || []);
      setLoading(false);
    }
    fetchReports();
  }, []);

  async function handleAction(reportId: string, newStatus: 'resolved' | 'dismissed') {
    setActionLoading(reportId);
    const supabase = createBrowserSupabase();
    await supabase.from('reports').update({ status: newStatus }).eq('id', reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
    setActionLoading(null);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-amber-500" /> Moderation Queue
      </h1>

      {reports.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">No pending reports!</h2>
          <p className="text-muted-foreground mt-2">The community is behaving well.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase mb-3 ${
                  report.target_type === 'general' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {report.target_type === 'general' ? 'Support / Issue' : report.target_type}
                </span>
                
                <h3 className="font-bold text-foreground text-lg">Reason: {report.reason}</h3>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{report.details || 'No additional details provided.'}</p>
                
                <p className="mt-4 text-xs text-muted-foreground">
                  Reported on: {formatDate(report.created_at)}
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0 md:w-48">
                {/* Only show View Target if it's a listing or seller report */}
                {(report.target_type === 'listing' || report.target_type === 'seller' || report.target_type === 'buyer') && (
                  <Link 
                    href={
                      report.target_type === 'listing' 
                        ? `/listing/${report.target_id}` 
                        : `/store/${report.target_id}`
                    }
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    <ExternalLink className="h-4 w-4" /> View Target
                  </Link>
                )}
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(report.id, 'resolved')}
                    disabled={actionLoading === report.id}
                    className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Resolve
                  </button>
                  <button 
                    onClick={() => handleAction(report.id, 'dismissed')}
                    disabled={actionLoading === report.id}
                    className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}