import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/lib/logger';
import { getValidYouTubeToken } from '@/src/lib/providers/youtube';
import { startOfDay, subDays, format, parseISO } from 'date-fns';

const YOUTUBE_ANALYTICS_BASE = 'https://youtubeanalytics.googleapis.com/v2/reports';

/**
 * syncYouTubeMetrics
 * 
 * Fetches the last 30 days of YouTube Channel Analytics (Views, Watch Time, Comments, Likes)
 * for all connected YouTube accounts.
 * Upserts the results into the DailyMetric table.
 */
export async function syncYouTubeMetrics() {
  logger.info('YouTubeService', 'Starting YouTube metrics sync job (30-day backfill)');

  const connections = await prisma.oAuthConnection.findMany({
    where: { provider: 'YOUTUBE' },
    include: { account: true },
  });

  if (connections.length === 0) {
    logger.info('YouTubeService', 'No connected YouTube accounts found. Skipping.');
    return { success: true, channelsSynced: 0 };
  }

  // YouTube Analytics requires exact formatting YYYY-MM-DD
  const endDate = subDays(startOfDay(new Date()), 1);
  const startDate = subDays(endDate, 30); // Fetch the last 30 days!
  
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');

  let successCount = 0;
  let errorCount = 0;

  for (const connection of connections) {
    const account = connection.account;
    try {
      const accessToken = await getValidYouTubeToken(account.id);
      
      const params = new URLSearchParams({
        ids: 'channel==MINE',
        startDate: formattedStartDate,
        endDate: formattedEndDate,
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

      if (rows.length > 0) {
        // Since we asked for 30 days, we'll get up to 30 rows!
        for (const rowData of rows) {
          const rowDateStr  = rowData[0]; // 'YYYY-MM-DD'
          const views       = parseInt(rowData[1] || '0');
          const watchTimeM  = parseFloat(rowData[2] || '0'); 
          const engagements = parseInt(rowData[3] || '0') + parseInt(rowData[4] || '0');
          const subsGained  = parseInt(rowData[5] || '0');
          const watchTimeH  = parseFloat((watchTimeM / 60).toFixed(2));

          const rowDate = parseISO(rowDateStr);

          await prisma.dailyMetric.upsert({
            where: {
              accountId_date: {
                accountId: account.id,
                date: rowDate,
              },
            },
            create: {
              accountId: account.id,
              date: rowDate,
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
        }
      } else {
        logger.warn('YouTubeService', `No analytics payload returned for ${account.name}`);
      }
      
      await prisma.account.update({
        where: { id: account.id },
        data: { lastSyncedAt: new Date() },
      });

      successCount++;
    } catch (err) {
      errorCount++;
      logger.error('YouTubeService', `Sync failed for account ${account.name}`, { error: err });
    }
  }

  return { success: true, channelsSynced: successCount, errors: errorCount };
}
