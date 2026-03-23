"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  Calendar, 
  Filter, 
  Instagram, 
  Youtube, 
  Facebook,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const platforms = [
  { id: 'all', name: 'All Platforms', icon: LayoutGrid },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
];

const dateRanges = [
  { id: '7d', name: 'Last 7 days' },
  { id: '30d', name: 'Last 30 days' },
  { id: '90d', name: 'Last 90 days' },
  { id: 'custom', name: 'Custom Range' },
];

export function DashboardFilters() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedRange, setSelectedRange] = useState('30d');

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="flex items-center gap-2">
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {platforms.map((platform) => {
            const isActive = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  isActive 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <platform.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{platform.name}</span>
              </button>
            );
          })}
        </div>

        <div className="h-8 w-px bg-zinc-800 mx-2 hidden md:block" />

        <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
          <Filter className="w-4 h-4" />
          <span>All Accounts</span>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>{dateRanges.find(r => r.id === selectedRange)?.name}</span>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          Export Report
        </button>
      </div>
    </div>
  );
}
