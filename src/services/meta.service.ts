import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/lib/logger';
import { startOfDay, subDays } from 'date-fns';

const META_GRAPH_BASE = 'https://graph.facebook.com/v20.0';

/**
 * syncMetaMetrics
 * 
 * Fetches the last 30 days of insights (Reach, Impressions, Engagement) for all connected
 * Facebook Pages and Instagram Professional Accounts.
 * Upserts the results into the DailyMetric table.
 */
export async function syncMetaMetrics() {
  logger.info('MetaService', 'Starting Meta metrics sync job (30-day backfill)');

  // Fetch all Meta accounts
  const accounts = await prisma.account.findMany({
    where: {
      platform: { in: ['FACEBOOK', 'INSTAGRAM'] },
      accessToken: { not: null },
    },
  });

  if (accounts.length === 0) {
    logger.info('MetaService', 'No connected Meta accounts found. Skipping.');
    return { success: true, accountsSynced: 0 };
  }

  // Define the time window: 30 days ago until today
  const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
  const sinceTimestamp = Math.floor(thirtyDaysAgo.getTime() / 1000);
  const untilTimestamp = Math.floor(startOfDay(new Date()).getTime() / 1000);

  let successCount = 0;
  let errorCount = 0;

  for (const account of accounts) {
    try {
      const accessToken = account.accessToken!;
      
      const dailyData: Record<string, { reach: number, impressions: number, engagements: number }> = {};

      if (account.platform === 'FACEBOOK') {
        const params = new URLSearchParams({
          metric: 'page_impressions_unique,page_impressions,page_post_engagements',
          period: 'day',
          since: sinceTimestamp.toString(),
          until: untilTimestamp.toString(),
          access_token: accessToken,
        });

        const res = await fetch(`${META_GRAPH_BASE}/${account.nativeId}/insights?${params.toString()}`);
        if (!res.ok) throw new Error(`FB Insights API failed: ${res.statusText}`);

        const { data } = await res.json();
        
        data.forEach((insight: any) => {
           insight.values?.forEach((valObj: any) => {
             const dayRaw = valObj.end_time.split('T')[0];
             if (!dailyData[dayRaw]) dailyData[dayRaw] = { reach: 0, impressions: 0, engagements: 0 };
             
             if (insight.name === 'page_impressions_unique') dailyData[dayRaw].reach = valObj.value || 0;
             if (insight.name === 'page_impressions') dailyData[dayRaw].impressions = valObj.value || 0;
             if (insight.name === 'page_post_engagements') dailyData[dayRaw].engagements = valObj.value || 0;
           });
        });

      } else if (account.platform === 'INSTAGRAM') {
        const params = new URLSearchParams({
          metric: 'reach,impressions,total_interactions',
          period: 'day',
          since: sinceTimestamp.toString(),
          until: untilTimestamp.toString(),
          access_token: accessToken,
        });

        const res = await fetch(`${META_GRAPH_BASE}/${account.nativeId}/insights?${params.toString()}`);
        if (!res.ok) throw new Error(`IG Insights API failed: ${res.statusText}`);

        const { data } = await res.json();
        
        data.forEach((insight: any) => {
          insight.values?.forEach((valObj: any) => {
            const dayRaw = valObj.end_time.split('T')[0];
            if (!dailyData[dayRaw]) dailyData[dayRaw] = { reach: 0, impressions: 0, engagements: 0 };
            
            if (insight.name === 'reach') dailyData[dayRaw].reach = valObj.value || 0;
            if (insight.name === 'impressions') dailyData[dayRaw].impressions = valObj.value || 0;
            if (insight.name === 'total_interactions') dailyData[dayRaw].engagements = valObj.value || 0;
          });
        });
      }

      // Bulk upsert all days into the database
      for (const [dayString, metrics] of Object.entries(dailyData)) {
        const rowDate = new Date(dayString);
        await prisma.dailyMetric.upsert({
          where: {
            accountId_date: { accountId: account.id, date: rowDate },
          },
          create: {
            accountId: account.id,
            date: rowDate,
            reach: metrics.reach,
            impressions: metrics.impressions,
            engagements: metrics.engagements,
            rawMetrics: { syncedAt: new Date().toISOString() },
          },
          update: {
            reach: metrics.reach,
            impressions: metrics.impressions,
            engagements: metrics.engagements,
            rawMetrics: { syncedAt: new Date().toISOString(), updated: true },
          },
        });
      }

      // Update the lastSyncedAt timestamp on the account
      await prisma.account.update({
        where: { id: account.id },
        data: { lastSyncedAt: new Date() },
      });

      successCount++;
    } catch (err) {
      errorCount++;
      logger.error('MetaService', `Sync failed for account ${account.name} (${account.id})`, { error: err });
    }
  }

  logger.info('MetaService', `Sync complete. Success: ${successCount}, Errors: ${errorCount}`);
  
  return { success: true, accountsSynced: successCount, errors: errorCount };
}
