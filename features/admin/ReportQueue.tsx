// features/admin/ReportQueue.tsx
'use client';

import { resolveReport } from '@/actions/admin';
import { formatDate } from '@/lib/format';

export function ReportQueue({ reports }: { reports: any[] }) {
  async function handleAction(id: string, status: 'resolved' | 'dismissed') {
    await resolveReport(id, status, 'Reviewed by admin');
  }
  
  if (reports.length === 0) {
    return <div className="rounded-xl border border-border bg-background p-12 text-center text-muted-foreground">No pending reports.</div>;
  }
  
  return (
    <div className="space-y-4">
      {reports.map(r => (
        <div key={r.id} className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-red-600">{r.reason}</h3>
            <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
          </div>
          <p className="mt-2 text-sm">{r.details || 'No details provided.'}</p>
          <p className="mt-2 text-xs text-muted-foreground">Target: {r.target_type} ({r.target_id})</p>
          
          <div className="mt-4 flex gap-2">
            <button onClick={() => handleAction(r.id, 'resolved')} className="rounded bg-foreground px-4 py-1.5 text-xs font-medium text-background">Resolve</button>
            <button onClick={() => handleAction(r.id, 'dismissed')} className="rounded border border-border px-4 py-1.5 text-xs font-medium">Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
}