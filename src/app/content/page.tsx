"use client";

import { useEffect, useState } from "react";
import { ContentTable } from "@/src/components/dashboard/ContentTable";
import { DashboardFilters } from "@/src/components/dashboard/DashboardFilters";
import { Loader2 } from "lucide-react";

export default function ContentPerformancePage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/metrics/content');
        const data = await res.json();
        setContent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Content Performance</h1>
      <p className="text-zinc-500 mt-1">Detailed analysis of your posts, reels, and videos.</p>
      
      <DashboardFilters />
      
      <div className="mt-8">
        <ContentTable data={content} />
      </div>
    </div>
  );
}
