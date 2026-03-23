"use client";

import { 
  Instagram, 
  Youtube, 
  Facebook, 
  Settings as SettingsIcon, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Key
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const connections = [
  { id: 'ig', name: 'Instagram', platform: 'INSTAGRAM', icon: Instagram, status: 'connected', account: '@johndoe_creative' },
  { id: 'fb', name: 'Facebook', platform: 'FACEBOOK', icon: Facebook, status: 'connected', account: 'John Doe Creative Page' },
  { id: 'yt', name: 'YouTube', platform: 'YOUTUBE', icon: Youtube, status: 'disconnected', account: null },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
      <p className="text-zinc-500 mt-1">Manage your platform connections and account preferences.</p>

      <div className="mt-12 space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-semibold text-white">Platform Connections</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {connections.map((conn) => (
              <div 
                key={conn.id} 
                className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    conn.platform === 'INSTAGRAM' && "bg-pink-500/10 text-pink-500",
                    conn.platform === 'FACEBOOK' && "bg-blue-500/10 text-blue-500",
                    conn.platform === 'YOUTUBE' && "bg-red-500/10 text-red-500",
                  )}>
                    <conn.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{conn.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {conn.status === 'connected' ? `Connected as ${conn.account}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                  {conn.status === 'connected' ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </div>
                      <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <a 
                      href={conn.platform === 'YOUTUBE' ? '/api/connect/youtube' : '/api/connect/meta'}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Connect {conn.name}
                    </a>
                  )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-semibold text-white">Database Status</h2>
          </div>
          
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Prisma ORM Status</p>
                <p className="text-sm text-zinc-500 mt-1">Connected to PostgreSQL (Mocked for MVP)</p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                Local SQLite / Mock
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">
                Run Database Migration
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
