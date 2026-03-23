import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/lib/logger';
import { startOfDay, subDays, format } from 'date-fns';

const META_GRAPH_BASE = 'https://graph.facebook.com/v20.0';

/**
 * syncMetaMetrics
 * 
 * Fetches yesterday's insights (Reach, Impressions, Engagement) for all connected
 * Facebook Pages and Instagram Professional Accounts.
 * Upserts the results into the DailyMetric table.
 */
export async function syncMetaMetrics() {
  logger.info('MetaService', 'Starting Meta metrics sync job');

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

  // Define the time window: yesterday
  const yesterday = subDays(startOfDay(new Date()), 1);
  const sinceTimestamp = Math.floor(yesterday.getTime() / 1000);
  const untilTimestamp = Math.floor(startOfDay(new Date()).getTime() / 1000);

  let successCount = 0;
  let errorCount = 0;

  for (const account of accounts) {
    try {
      const accessToken = account.accessToken!;
      let reach = 0;
      let impressions = 0;
      let engagements = 0;

      if (account.platform === 'FACEBOOK') {
        // Facebook Page Insights
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
        
        // Parse the returned data array back into standard integers
        data.forEach((insight: any) => {
           const val = insight.values?.[0]?.value || 0;
           if (insight.name === 'page_impressions_unique') reach = val;
           if (insight.name === 'page_impressions') impressions = val;
           if (insight.name === 'page_post_engagements') engagements = val;
        });

      } else if (account.platform === 'INSTAGRAM') {
        // Instagram Insights
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
          const val = insight.values?.[0]?.value || 0;
          if (insight.name === 'reach') reach = val;
          if (insight.name === 'impressions') impressions = val;
          if (insight.name === 'total_interactions') engagements = val;
        });
      }

      // Upsert the metric data into the database
      await prisma.dailyMetric.upsert({
        where: {
          accountId_date: {
            accountId: account.id,
            date: yesterday,
          },
        },
        create: {
          accountId: account.id,
          date: yesterday,
          reach,
          impressions,
          engagements,
          rawMetrics: { syncedAt: new Date().toISOString() }, // Store raw debug context
        },
        update: {
          reach,
          impressions,
          engagements,
          rawMetrics: { syncedAt: new Date().toISOString(), updated: true },
        },
      });

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
  
  return { 
    success: true, 
    accountsSynced: successCount, 
    errors: errorCount 
  };
}
