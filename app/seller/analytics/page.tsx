'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, MessageCircle, AlertCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function SellerAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      // 1. Get all listings for this seller
      const { data: listings, error: listError } = await supabase
        .from('listings')
        .select('id')
        .eq('seller_id', user.id);

      if (listError) {
        setErrorMsg(listError.message);
        setLoading(false);
        return;
      }

      if (!listings || listings.length === 0) {
        setLoading(false);
        return;
      }

      const ids = listings.map((l) => l.id);

      // 2. Total views and clicks
      const { count: views } = await supabase
        .from('listing_events')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', ids)
        .eq('event_type', 'view');

      const { count: clicks } = await supabase
        .from('listing_events')
        .select('*', { count: 'exact', head: true })
        .in('listing_id', ids)
        .eq('event_type', 'whatsapp_click');

      setStats({ views: views || 0, clicks: clicks || 0 });

      // 3. 7-day chart data
      const { data: events } = await supabase
        .from('listing_events')
        .select('event_type, created_at')
        .in('listing_id', ids)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const chart = last7Days.map((date) => {
        const dayEvents = events?.filter((e) => e.created_at.startsWith(date)) || [];
        return {
          date: new Date(date).toLocaleDateString('en-NG', { weekday: 'short' }),
          views: dayEvents.filter((e) => e.event_type === 'view').length,
          clicks: dayEvents.filter((e) => e.event_type === 'whatsapp_click').length,
        };
      });

      setChartData(chart);
      setLoading(false);
    }

    loadAnalytics();
  }, [router]);

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.views, d.clicks)), 10);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 pb-32">
      <div className="mb-8">
        <Link
          href="/seller"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" /> Store Analytics
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-3xl p-8 text-center">
          <Eye className="h-8 w-8 text-blue-500 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Total Views</p>
          <p className="text-5xl font-bold text-foreground">{stats.views}</p>
        </div>
        <div className="glass-card rounded-3xl p-8 text-center">
          <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-2">WhatsApp Clicks</p>
          <p className="text-5xl font-bold text-foreground">{stats.clicks}</p>
        </div>
      </div>

      {/* CHART */}
      {chartData.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h2 className="mb-6 font-semibold text-foreground">Last 7 Days Activity</h2>
          <div className="flex h-48 items-end justify-between gap-2">
            {chartData.map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full items-end justify-center gap-1 h-full">
                  <div
                    className="w-1/3 rounded-t-sm bg-blue-500/50"
                    style={{ height: `${(day.views / maxVal) * 100}%` }}
                    title={`${day.views} views`}
                  />
                  <div
                    className="w-1/3 rounded-t-sm bg-primary"
                    style={{ height: `${(day.clicks / maxVal) * 100}%` }}
                    title={`${day.clicks} clicks`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-blue-500/50 rounded-full" /> Views
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-primary rounded-full" /> Clicks
            </span>
          </div>
        </div>
      )}
    </div>
  );
}