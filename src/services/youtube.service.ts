/**
 * Mock Service for YouTube Data & Analytics API
 * TODO: Implement real OAuth flow and API calls using axios or fetch
 */

export const youtubeDataService = {
  /**
   * Fetches channel and video metadata
   */
  async getChannelMetadata(channelId: string) {
    console.log(`[YouTubeDataService] Fetching metadata for channel ${channelId}`);
    return {
      id: channelId,
      title: 'Tech Insights Channel',
      subscriberCount: 15400,
      videoCount: 84,
      viewCount: 1250000,
    };
  },

  async getVideos(channelId: string) {
    return [
      {
        id: 'v1',
        title: 'Next.js 15 Tutorial: What\'s New?',
        publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        thumbnail: 'https://picsum.photos/seed/yt1/320/180',
      },
      {
        id: 'v2',
        title: 'Social Media Analytics with Prisma',
        publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        thumbnail: 'https://picsum.photos/seed/yt2/320/180',
      }
    ];
  }
};

export const youtubeAnalyticsService = {
  /**
   * Fetches performance metrics for a channel or video
   */
  async getMetrics(channelId: string, dateRange: { from: Date; to: Date }) {
    console.log(`[YouTubeAnalyticsService] Fetching metrics for channel ${channelId}`);
    
    return {
      views: Math.floor(Math.random() * 50000) + 10000,
      watchTimeMinutes: Math.floor(Math.random() * 200000) + 50000,
      subscribersGained: Math.floor(Math.random() * 500) + 100,
      averageViewDuration: Math.floor(Math.random() * 300) + 120, // seconds
    };
  }
};
