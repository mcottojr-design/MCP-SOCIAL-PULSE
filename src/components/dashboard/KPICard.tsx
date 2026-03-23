"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatNumber } from "@/src/lib/utils";
import { motion } from "motion/react";

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  suffix?: string;
  prefix?: string;
}

export function KPICard({ title, value, change, trend, suffix = "", prefix = "" }: KPICardProps) {
  const isUp = trend === 'up';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          isUp 
            ? "bg-emerald-500/10 text-emerald-500" 
            : "bg-rose-500/10 text-rose-500"
        )}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}%
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">
          {prefix}{formatNumber(value)}{suffix}
        </span>
      </div>
    </motion.div>
  );
}
