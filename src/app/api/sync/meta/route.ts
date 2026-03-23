import { NextResponse } from 'next/server';
import { metaService } from '@/src/services/meta.service';
import { metricsNormalizer } from '@/src/services/metrics-normalizer';

/**
 * Route: /api/sync/meta
 * Triggers a manual sync for Meta accounts
 */
export async function POST(request: Request) {
  try {
    const { accountId } = await request.json();
    
    // 1. Fetch raw data from Meta
    const rawData = await metaService.getInsights(accountId, { 
      from: new Date(Date.now() - 86400000 * 30), // Last 30 days
      to: new Date() 
    });
    
    // 2. Normalize data
    const normalized = metricsNormalizer.normalizeMeta(rawData, 'INSTAGRAM'); // Example
    
    // 3. TODO: Store in Prisma database
    // await prisma.dailyMetric.upsert({ ... });
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced Meta account: ${accountId}`,
      data: normalized
    });
  } catch (error) {
    console.error('[SyncMeta] Sync failed:', error);
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}
