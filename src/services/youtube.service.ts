import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/lib/logger';
import { getValidYouTubeToken } from '@/src/lib/providers/youtube';
import { startOfDay, subDays, format } from 'date-fns';

const YOUTUBE_ANALYTICS_BASE = 'https://youtubeanalytics.googleapis.com/v2/reports';

/**
 * syncYouTubeMetrics
 * 
 * Fetches yesterday's YouTube Channel Analytics (Views, Watch Time, Comments, Likes)
 * for all connected YouTube accounts, via their automatically refreshed tokens.
 * Upserts the results into the DailyMetric table.
 */
export async function syncYouTubeMetrics() {
  logger.info('YouTubeService', 'Starting YouTube metrics sync job');

  // Fetch all YouTube accounts that have an active OAuth Connection
  const connections = await prisma.oAuthConnection.findMany({
    where: { provider: 'YOUTUBE' },
    include: { account: true },
  });

  if (connections.length === 0) {
    logger.info('YouTubeService', 'No connected YouTube accounts found. Skipping.');
    return { success: true, channelsSynced: 0 };
  }

  // YouTube Analytics requires exact formatting YYYY-MM-DD
  const yesterdayDate = subDays(startOfDay(new Date()), 1);
  const formattedDate = format(yesterdayDate, 'yyyy-MM-dd');

  let successCount = 0;
  let errorCount = 0;

  for (const connection of connections) {
    const account = connection.account;
    try {
      // ALWAYS use the token provider here. It handles the `refresh_token` swap.
      const accessToken = await getValidYouTubeToken(account.id);
      
      const params = new URLSearchParams({
        ids: 'channel==MINE',
        startDate: formattedDate,
        endDate: formattedDate,
        // The core metrics we care about:
        metrics: 'views,estimatedMinutesWatched,comments,likes,subscribersGained',
        dimensions: 'day',
      });

      const res = await fetch(`${YOUTUBE_ANALYTICS_BASE}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
         const err = await res.json();
         throw new Error(`YT API Error: ${err?.error?.message || res.statusText}`);
      }

      const report = await res.json();
      const rows = report.rows || [];

      // Output array from dimensions ['day', 'views', 'watchtime', 'comments', 'likes', 'subsGained']
      if (rows.length > 0) {
        const todayData = rows[0]; 
        const views       = parseInt(todayData[1] || '0');
        const watchTimeM  = parseFloat(todayData[2] || '0'); 
        const engagements = parseInt(todayData[3] || '0') + parseInt(todayData[4] || '0'); // comments + likes
        const subsGained  = parseInt(todayData[5] || '0');

        // Convert estimatedMinutesWatched to Hours for the dashboard
        const watchTimeH = parseFloat((watchTimeM / 60).toFixed(2));

        await prisma.dailyMetric.upsert({
          where: {
            accountId_date: {
              accountId: account.id,
              date: yesterdayDate,
            },
          },
          create: {
            accountId: account.id,
            date: yesterdayDate,
            views,
            watchTime: watchTimeH,
            engagements,
            followersGained: subsGained,
            rawMetrics: { syncedAt: new Date().toISOString() }, 
          },
          update: {
            views,
            watchTime: watchTimeH,
            engagements,
            followersGained: subsGained,
            rawMetrics: { syncedAt: new Date().toISOString(), updated: true },
          },
        });
      } else {
        logger.warn('YouTubeService', `No analytics payload returned for ${account.name} on ${formattedDate}`);
      }
      
      await prisma.account.update({
        where: { id: account.id },
        data: { lastSyncedAt: new Date() },
      });

      successCount++;
    } catch (err) {
      errorCount++;
      logger.error('YouTubeService', `Sync failed for account ${account.name} (${account.id})`, { error: err });
    }
  }

  logger.info('YouTubeService', `Sync complete. Success: ${successCount}, Errors: ${errorCount}`);
  
  return { 
    success: true, 
    channelsSynced: successCount, 
    errors: errorCount 
  };
}
