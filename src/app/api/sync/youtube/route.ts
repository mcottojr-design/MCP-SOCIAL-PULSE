import { NextResponse } from 'next/server';
import { youtubeAnalyticsService } from '@/src/services/youtube.service';
import { metricsNormalizer } from '@/src/services/metrics-normalizer';

/**
 * Route: /api/sync/youtube
 * Triggers a manual sync for YouTube accounts
 */
export async function POST(request: Request) {
  try {
    const { accountId } = await request.json();
    
    // 1. Fetch raw data from YouTube
    const rawData = await youtubeAnalyticsService.getMetrics(accountId, { 
      from: new Date(Date.now() - 86400000 * 30), // Last 30 days
      to: new Date() 
    });
    
    // 2. Normalize data
    const normalized = metricsNormalizer.normalizeYouTube(rawData);
    
    // 3. TODO: Store in Prisma database
    // await prisma.dailyMetric.upsert({ ... });
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced YouTube account: ${accountId}`,
      data: normalized
    });
  } catch (error) {
    console.error('[SyncYouTube] Sync failed:', error);
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}
