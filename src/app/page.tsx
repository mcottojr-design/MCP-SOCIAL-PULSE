"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/src/components/dashboard/KPICard";
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters";
import { MetricsChart } from "@/src/components/dashboard/MetricsChart";
import { ContentTable } from "@/src/components/dashboard/ContentTable";
import { motion } from "motion/react";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, contentRes] = await Promise.all([
        fetch('/api/metrics/overview?dateRange=30d'),
        fetch('/api/metrics/content')
      ]);

      if (!overviewRes.ok || !contentRes.ok) throw new Error('Failed to fetch data');

      const overviewData = await overviewRes.json();
      const contentData = await contentRes.json();

      setData(overviewData);
      setContent(contentData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading your insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
          <p className="text-zinc-500 mt-1">{error}</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between pt-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-500 mt-1">Real-time performance across all connected platforms.</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <DashboardFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Total Reach" 
          value={data.kpis.reach.value} 
          change={data.kpis.reach.change} 
          trend={data.kpis.reach.trend} 
        />
        <KPICard 
          title="Impressions" 
          value={data.kpis.impressions.value} 
          change={data.kpis.impressions.change} 
          trend={data.kpis.impressions.trend} 
        />
        <KPICard 
          title="Engagements" 
          value={data.kpis.engagements.value} 
          change={data.kpis.engagements.change} 
          trend={data.kpis.engagements.trend} 
        />
        <KPICard 
          title="Engagement Rate" 
          value={data.kpis.engagementRate.value} 
          change={data.kpis.engagementRate.change} 
          trend={data.kpis.engagementRate.trend} 
          suffix="%"
        />
        <KPICard 
          title="Followers Gained" 
          value={data.kpis.followersGained.value} 
          change={data.kpis.followersGained.change} 
          trend={data.kpis.followersGained.trend} 
        />
        <KPICard 
          title="Video Views" 
          value={data.kpis.views.value} 
          change={data.kpis.views.change} 
          trend={data.kpis.views.trend} 
        />
        <KPICard 
          title="Watch Time" 
          value={data.kpis.watchTime.value} 
          change={data.kpis.watchTime.change} 
          trend={data.kpis.watchTime.trend} 
          suffix="h"
        />
        <KPICard 
          title="Link Clicks" 
          value={data.kpis.linkClicks.value} 
          change={data.kpis.linkClicks.change} 
          trend={data.kpis.linkClicks.trend} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MetricsChart 
          title="Reach Over Time" 
          data={data.chartData} 
          dataKey="reach" 
          color="#6366f1" 
        />
        <MetricsChart 
          title="Engagements" 
          data={data.chartData} 
          dataKey="engagements" 
          color="#10b981" 
        />
      </div>

      <div className="mb-12">
        <ContentTable data={content} />
      </div>
    </div>
  );
}
