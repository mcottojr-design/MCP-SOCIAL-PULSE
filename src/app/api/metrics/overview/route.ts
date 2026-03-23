import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { subDays, startOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * Route: /api/metrics/overview
 * Returns aggregated metrics from the real `DailyMetric` database tables.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    
    // Fetch the last 30 days of metrics
    const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
    
    const whereClause: any = {
      date: { gte: thirtyDaysAgo }
    };

    // Filter by specific platform if requested from the dropdown
    if (platform && platform !== 'ALL') {
      whereClause.account = { platform: platform.toUpperCase() };
    }

    const metrics = await prisma.dailyMetric.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    // Helper to calculate totals from the array
    const sum = (metricData: typeof metrics, field: keyof typeof metrics[0]) => 
      metricData.reduce((acc, row) => acc + ((row[field] as number) || 0), 0);

    const totalReach = sum(metrics, 'reach');
    const totalImpressions = sum(metrics, 'impressions');
    const totalViews = sum(metrics, 'views');
    const totalEngagements = sum(metrics, 'engagements');
    const totalFollowers = sum(metrics, 'followersGained');
    const totalWatchTime = sum(metrics, 'watchTime');
    const totalLinkClicks = sum(metrics, 'linkClicks');

    // Grouping for the Recharts graph data
    const chartDataMap: Record<string, any> = {};
    metrics.forEach(m => {
      const day = m.date.toISOString().split('T')[0];
      if (!chartDataMap[day]) {
        chartDataMap[day] = { date: day, reach: 0, engagements: 0, views: 0 };
      }
      chartDataMap[day].reach += m.reach;
      chartDataMap[day].engagements += m.engagements;
      chartDataMap[day].views += m.views;
    });

    const overviewData = {
      kpis: {
        reach: { value: totalReach, change: 0, trend: 'up' },
        impressions: { value: totalImpressions, change: 0, trend: 'up' },
        views: { value: totalViews, change: 0, trend: 'up' },
        engagements: { value: totalEngagements, change: 0, trend: 'up' },
        engagementRate: { value: totalReach > 0 ? ((totalEngagements / totalReach) * 100).toFixed(1) : 0, change: 0, trend: 'up' },
        followersGained: { value: totalFollowers, change: 0, trend: 'up' },
        watchTime: { value: totalWatchTime.toFixed(1), change: 0, trend: 'up' },
        linkClicks: { value: totalLinkClicks, change: 0, trend: 'up' },
      },
      chartData: Object.values(chartDataMap).sort((a, b) => a.date.localeCompare(b.date)),
    };

    return NextResponse.json(overviewData);
  } catch (error) {
    console.error('Failed to load overview metrics:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
