import { Youtube, RefreshCw } from "lucide-react";
import { KPICard } from "@/src/components/dashboard/KPICard";
import { MetricsChart } from "@/src/components/dashboard/MetricsChart";
import { prisma } from "@/src/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function YouTubeDetailPage() {
  // Grab the last 30 days of data mapped directly to the YouTube accounts
  const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
  
  const metrics = await prisma.dailyMetric.findMany({
    where: { 
      account: { platform: 'YOUTUBE' },
      date: { gte: thirtyDaysAgo }
    },
    orderBy: { date: 'asc' }
  });

  const sum = (field: keyof typeof metrics[0]) => 
    metrics.reduce((acc, row) => acc + ((row[field] as number) || 0), 0);

  const totalViews = sum('views');
  const totalWatchTime = sum('watchTime');
  const totalSubs = sum('followersGained');
  const totalEngagements = sum('engagements');

  // Map database elements cleanly for Recharts
  const chartData = metrics.map(m => ({
    date: m.date.toISOString().split('T')[0],
    views: m.views,
    watchTime: m.watchTime,
    engagements: m.engagements,
    subs: m.followersGained
  }));

  return (
    <div className="max-w-7xl mx-auto pt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Youtube className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">YouTube Analytics</h1>
            <p className="text-zinc-500 mt-1">Deep dive into your channel's 30-day performance.</p>
          </div>
        </div>
        <a 
          href="/api/sync/youtube"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Sync YouTube Data
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Views" value={totalViews} change={0} trend="up" />
        <KPICard title="Watch Time (h)" value={parseFloat(totalWatchTime.toFixed(1))} change={0} trend="up" />
        <KPICard title="Subscribers Gained" value={totalSubs} change={0} trend="up" />
        <KPICard title="Total Engagements" value={totalEngagements} change={0} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MetricsChart 
          title="Daily View Trend" 
          data={chartData} 
          dataKey="views" 
          color="#ef4444" 
        />
        <MetricsChart 
          title="Daily Watch Time (h)" 
          data={chartData} 
          dataKey="watchTime" 
          color="#f59e0b" 
        />
      </div>
    </div>
  );
}
