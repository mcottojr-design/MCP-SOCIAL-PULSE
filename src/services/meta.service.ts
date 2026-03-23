/**
 * Mock Service for Meta Graph API (Facebook & Instagram)
 * TODO: Implement real OAuth flow and API calls using axios or fetch
 */

export interface MetaAccount {
  id: string;
  name: string;
  platform: 'FACEBOOK' | 'INSTAGRAM';
  followers: number;
  engagement_rate: number;
}

export const metaService = {
  /**
   * Fetches insights for a Facebook Page or Instagram Account
   */
  async getInsights(accountId: string, dateRange: { from: Date; to: Date }) {
    console.log(`[MetaService] Fetching insights for ${accountId} from ${dateRange.from} to ${dateRange.to}`);
    
    // Mock data generation
    return {
      reach: Math.floor(Math.random() * 10000) + 5000,
      impressions: Math.floor(Math.random() * 20000) + 10000,
      engagements: Math.floor(Math.random() * 1000) + 200,
      link_clicks: Math.floor(Math.random() * 500) + 50,
      followers_gained: Math.floor(Math.random() * 100) + 10,
    };
  },

  /**
   * Fetches media/post performance
   */
  async getMediaPerformance(accountId: string) {
    return [
      {
        id: 'm1',
        title: 'Summer Vibes 2024',
        type: 'REEL',
        reach: 12500,
        engagement: 840,
        publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'm2',
        title: 'Product Launch Announcement',
        type: 'POST',
        reach: 8200,
        engagement: 450,
        publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    ];
  }
};
