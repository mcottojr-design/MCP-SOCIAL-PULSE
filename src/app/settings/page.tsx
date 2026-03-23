import { 
  Instagram, 
  Youtube, 
  Facebook, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Key
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { prisma } from "@/src/lib/prisma";

// This turns the settings page into a dynamic Server Component
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // Aggressively bypass Next.js client-side memory caching
  const { unstable_noStore: noStore } = await import('next/cache');
  noStore();
  
  // 1. Fetch real connected accounts from the Neon Database
  const accounts = await prisma.account.findMany();

  // Helper to find if a specific platform is connected
  const getAccount = (platform: "INSTAGRAM" | "FACEBOOK" | "YOUTUBE") => {
    return accounts.find(a => a.platform === platform);
  };

  // 2. Map out the UI blocks based on the real database data
  const platforms = [
    { 
      id: 'ig', 
      name: 'Instagram', 
      platform: 'INSTAGRAM' as const, 
      icon: Instagram, 
      connectPath: '/api/connect/meta',
      accountInfo: getAccount('INSTAGRAM')
    },
    { 
      id: 'fb', 
      name: 'Facebook', 
      platform: 'FACEBOOK' as const, 
      icon: Facebook, 
      connectPath: '/api/connect/meta',
      accountInfo: getAccount('FACEBOOK')
    },
    { 
      id: 'yt', 
      name: 'YouTube', 
      platform: 'YOUTUBE' as const, 
      icon: Youtube, 
      connectPath: '/api/connect/youtube',
      accountInfo: getAccount('YOUTUBE')
    },
  ];

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
            {platforms.map((p) => {
              const isConnected = !!p.accountInfo;

              return (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      p.platform === 'INSTAGRAM' && "bg-pink-500/10 text-pink-500",
                      p.platform === 'FACEBOOK' && "bg-blue-500/10 text-blue-500",
                      p.platform === 'YOUTUBE' && "bg-red-500/10 text-red-500",
                    )}>
                      <p.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{p.name}</h3>
                      <p className="text-sm text-zinc-500">
                        {isConnected 
                          ? `Connected as ${p.accountInfo?.name}` 
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  
                  {isConnected ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </div>
                      {/* Note: Disconnect logic will be added via API endpoint later */}
                      <button disabled className="px-4 py-2 bg-zinc-800/50 text-zinc-500 text-sm font-medium rounded-lg cursor-not-allowed">
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <a 
                      href={p.connectPath}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Connect {p.name}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-white">Database Status</h2>
          </div>
          
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Neon PostgreSQL</p>
                <p className="text-sm text-zinc-500 mt-1">Live Production Database</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
               <p className="text-sm text-zinc-500">
                 Database schema is synchronized with Prisma ({accounts.length} total synced accounts).
               </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
