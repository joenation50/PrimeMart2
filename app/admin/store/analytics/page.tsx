'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { BarChart, Eye, MessageCircle } from 'lucide-react';

export default function AdminStoreAnalytics() {
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: listings } = await supabase.from('listings').select('id').eq('seller_id', user.id);
      
      if (listings && listings.length > 0) {
        const ids = listings.map(l => l.id);
        
        // Totals
        const { count: views } = await supabase.from('listing_events').select('*', { count: 'exact', head: true }).in('listing_id', ids).eq('event_type', 'view');
        const { count: clicks } = await supabase.from('listing_events').select('*', { count: 'exact', head: true }).in('listing_id', ids).eq('event_type', 'whatsapp_click');
        setStats({ views: views || 0, clicks: clicks || 0 });

        // 7 Day Chart Data
        const { data: events } = await supabase.from('listing_events').select('event_type, created_at').in('listing_id', ids).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const chart = last7Days.map(date => {
          const dayEvents = events?.filter(e => e.created_at.startsWith(date)) || [];
          return {
            date: new Date(date).toLocaleDateString('en-NG', { weekday: 'short' }),
            views: dayEvents.filter(e => e.event_type === 'view').length,
            clicks: dayEvents.filter(e => e.event_type === 'whatsapp_click').length,
          };
        });
        setChartData(chart);
      }
    }
    fetchAnalytics();
  }, []);

  const maxVal = Math.max(...chartData.map(d => Math.max(d.views, d.clicks)), 10);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-3"><BarChart className="h-8 w-8 text-primary" /> My Store Analytics</h1>
      
      <div className="grid grid-cols-2 gap-4">
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

      {chartData.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-6 font-semibold text-foreground">Last 7 Days Activity</h2>
          <div className="flex h-48 items-end justify-between gap-2">
            {chartData.map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full items-end justify-center gap-1 h-full">
                  <div className="w-1/3 rounded-t-sm bg-blue-500/50" style={{ height: `${(day.views / maxVal) * 100}%` }} title={`${day.views} views`} />
                  <div className="w-1/3 rounded-t-sm bg-primary" style={{ height: `${(day.clicks / maxVal) * 100}%` }} title={`${day.clicks} clicks`} />
                </div>
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><div className="h-2 w-2 bg-blue-500/50 rounded-full" /> Views</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 bg-primary rounded-full" /> Clicks</span>
          </div>
        </div>
      )}
    </div>
  );
}