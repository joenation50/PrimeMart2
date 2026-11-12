import { requireSeller } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { ArrowLeft, Eye, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Analytics · PrimeMart' };

export default async function AnalyticsPage() {
  const session = await requireSeller();
  const supabase = await createServerSupabase();

  // Fetch all events for this seller's listings over the last 30 days
  const { data: events } = await supabase
    .from('listing_events')
    .select(`
      event_type,
      created_at,
      listings!inner(seller_id)
    `)
    .eq('listings.seller_id', session.profile.id)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const totalViews = events?.filter(e => e.event_type === 'view').length || 0;
  const totalClicks = events?.filter(e => e.event_type === 'whatsapp_click').length || 0;
  
  // Group events by day for a simple chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayEvents = events?.filter(e => e.created_at.startsWith(date)) || [];
    return {
      date: new Date(date).toLocaleDateString('en-NG', { weekday: 'short' }),
      views: dayEvents.filter(e => e.event_type === 'view').length,
      clicks: dayEvents.filter(e => e.event_type === 'whatsapp_click').length,
    };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.views, d.clicks)), 10);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Last 30 days performance</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Views</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-foreground">{totalViews}</p>
            <Eye className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">WhatsApp Clicks</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-primary">{totalClicks}</p>
            <MessageCircle className="h-8 w-8 text-primary/30" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Conversion Rate</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-foreground">
              {totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0}%
            </p>
            <TrendingUp className="h-8 w-8 text-green-500/30" />
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-6 text-lg font-semibold">Views vs. Clicks (Last 7 Days)</h2>
        <div className="flex h-64 items-end justify-between gap-2 sm:gap-4">
          {chartData.map((day, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full items-end justify-center gap-1 h-full">
                {/* Views Bar */}
                <div 
                  className="w-1/3 rounded-t-md bg-muted-foreground/30 transition-all hover:bg-muted-foreground/50" 
                  style={{ height: `${(day.views / maxVal) * 100}%`, minHeight: day.views > 0 ? '4px' : '0' }}
                  title={`${day.views} views`}
                />
                {/* Clicks Bar */}
                <div 
                  className="w-1/3 rounded-t-md bg-primary transition-all hover:bg-primary/80" 
                  style={{ height: `${(day.clicks / maxVal) * 100}%`, minHeight: day.clicks > 0 ? '4px' : '0' }}
                  title={`${day.clicks} clicks`}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{day.date}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs font-medium">
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-muted-foreground/30" /> Views</div>
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-primary" /> WhatsApp Clicks</div>
        </div>
      </div>
    </div>
  );
}