"use client";

import { cn, formatNumber, formatPercent } from "@/src/lib/utils";
import { Instagram, Youtube, Facebook, ExternalLink } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'FACEBOOK';
  reach: number;
  views: number;
  engagements: number;
  engagementRate: number;
  publishedAt: string;
  thumbnail: string;
}

interface ContentTableProps {
  data: ContentItem[];
}

export function ContentTable({ data }: ContentTableProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400">Top Performing Content</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Content</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Reach</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Views</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Engagements</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Rate</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.platform === 'INSTAGRAM' && <Instagram className="w-3 h-3 text-pink-500" />}
                        {item.platform === 'YOUTUBE' && <Youtube className="w-3 h-3 text-red-500" />}
                        {item.platform === 'FACEBOOK' && <Facebook className="w-3 h-3 text-blue-500" />}
                        <span className="text-xs text-zinc-500">{item.type} • {new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300 text-right">{formatNumber(item.reach)}</td>
                <td className="px-6 py-4 text-sm text-zinc-300 text-right">{formatNumber(item.views)}</td>
                <td className="px-6 py-4 text-sm text-zinc-300 text-right">{formatNumber(item.engagements)}</td>
                <td className="px-6 py-4 text-sm text-emerald-500 text-right font-medium">{formatPercent(item.engagementRate)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
