"use client";

import { Instagram, Facebook, ExternalLink, RefreshCw } from "lucide-react";
import { KPICard } from "@/src/components/dashboard/KPICard";
import { MetricsChart } from "@/src/components/dashboard/MetricsChart";

export default function MetaDetailPage() {
  const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    reach: Math.floor(Math.random() * 5000) + 2000,
  }));

  return (
    <div className="max-w-7xl mx-auto pt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
            <Instagram className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Instagram & Facebook</h1>
            <p className="text-zinc-500 mt-1">Deep dive into your Meta platform performance.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          Sync Meta Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="IG Reach" value={84500} change={15.2} trend="up" />
        <KPICard title="FB Reach" value={42100} change={-4.8} trend="down" />
        <KPICard title="IG Engagements" value={12450} change={8.2} trend="up" />
        <KPICard title="FB Engagements" value={5400} change={2.1} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MetricsChart 
          title="Instagram Reach Trend" 
          data={mockChartData} 
          dataKey="reach" 
          color="#ec4899" 
        />
        <MetricsChart 
          title="Facebook Reach Trend" 
          data={mockChartData} 
          dataKey="reach" 
          color="#3b82f6" 
        />
      </div>
    </div>
  );
}
