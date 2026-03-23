import { NextResponse, NextRequest } from 'next/server';
import { syncMetaMetrics } from '@/src/services/meta.service';
import { logger } from '@/src/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Route: GET /api/sync/meta
 * To be called by Vercel Cron. Requires an Authorization header with a defined Cron secret
 * to prevent authorized requests from draining rate limits.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const CRON_SECRET = process.env.CRON_SECRET; 

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    logger.warn('MetaSync', 'Unauthorized execution attempt');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await syncMetaMetrics();
    return NextResponse.json(result);
  } catch (error) {
    logger.error('MetaSync', 'Uncaught runtime error during sync', { error });
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
