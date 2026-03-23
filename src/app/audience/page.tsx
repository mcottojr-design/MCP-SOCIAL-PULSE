"use client";

import { MetricsChart } from "@/src/components/dashboard/MetricsChart";
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters";
import { KPICard } from "@/src/components/dashboard/KPICard";

export default function AudienceGrowthPage() {
  const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    followers: Math.floor(Math.random() * 500) + 100,
  }));

  return (
    <div className="max-w-7xl mx-auto pt-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Audience Growth</h1>
      <p className="text-zinc-500 mt-1">Track your follower and subscriber trends.</p>
      
      <DashboardFilters />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KPICard title="Total Followers" value={45800} change={5.2} trend="up" />
        <KPICard title="New Followers (30d)" value={1240} change={12.8} trend="up" />
        <KPICard title="Unfollows (30d)" value={145} change={-2.1} trend="down" />
      </div>

      <div className="mb-8">
        <MetricsChart 
          title="Follower Growth Trend" 
          data={mockChartData} 
          dataKey="followers" 
          color="#8b5cf6" 
        />
      </div>
    </div>
  );
}
