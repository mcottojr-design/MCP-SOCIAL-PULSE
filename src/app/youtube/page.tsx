"use client";

import { Youtube, RefreshCw, PlayCircle, Clock, Users } from "lucide-react";
import { KPICard } from "@/src/components/dashboard/KPICard";
import { MetricsChart } from "@/src/components/dashboard/MetricsChart";

export default function YouTubeDetailPage() {
  const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    views: Math.floor(Math.random() * 5000) + 2000,
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
            <p className="text-zinc-500 mt-1">Deep dive into your channel and video performance.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          Sync YouTube Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Views" value={1250000} change={12.5} trend="up" />
        <KPICard title="Watch Time (h)" value={45000} change={8.2} trend="up" />
        <KPICard title="Subscribers" value={15400} change={5.1} trend="up" />
        <KPICard title="Avg View Duration" value={245} change={2.4} trend="up" suffix="s" />
      </div>

      <div className="mb-8">
        <MetricsChart 
          title="Daily View Trend" 
          data={mockChartData} 
          dataKey="views" 
          color="#ef4444" 
        />
      </div>
    </div>
  );
}
