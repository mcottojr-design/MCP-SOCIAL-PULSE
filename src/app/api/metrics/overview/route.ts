import { NextResponse } from 'next/server';

/**
 * Route: /api/metrics/overview
 * Returns aggregated metrics for the dashboard overview
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const accountId = searchParams.get('accountId');
  const dateRange = searchParams.get('dateRange'); // e.g., '30d', '7d', 'custom'

  console.log(`[MetricsOverview] Fetching overview for platform: ${platform}, account: ${accountId}, range: ${dateRange}`);

  // Mock aggregated data for the dashboard
  const mockOverview = {
    kpis: {
      reach: { value: 125400, change: 12.5, trend: 'up' },
      impressions: { value: 245800, change: 8.2, trend: 'up' },
      views: { value: 84200, change: -2.4, trend: 'down' },
      engagements: { value: 12450, change: 15.1, trend: 'up' },
      engagementRate: { value: 4.8, change: 0.5, trend: 'up' },
      followersGained: { value: 1240, change: 24.8, trend: 'up' },
      watchTime: { value: 450, change: 10.2, trend: 'up' }, // hours
      linkClicks: { value: 840, change: 5.4, trend: 'up' },
    },
    chartData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      reach: Math.floor(Math.random() * 5000) + 2000,
      engagements: Math.floor(Math.random() * 500) + 100,
      views: Math.floor(Math.random() * 3000) + 1000,
    })),
  };

  return NextResponse.json(mockOverview);
}
