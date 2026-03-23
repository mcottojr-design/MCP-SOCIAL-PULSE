import { NextResponse, NextRequest } from 'next/server';
import { syncYouTubeMetrics } from '@/src/services/youtube.service';
import { logger } from '@/src/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Route: GET /api/sync/youtube
 * To be called by Vercel Cron to trigger the Daily Sync jobs.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const CRON_SECRET = process.env.CRON_SECRET; 

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    logger.warn('YouTubeSync', 'Unauthorized execution attempt');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await syncYouTubeMetrics();
    return NextResponse.json(result);
  } catch (error: any) {
    logger.error('YouTubeSync', 'Uncaught runtime error during sync', { error });
    return NextResponse.json({ 
      error: 'Sync failed', 
      message: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
}
