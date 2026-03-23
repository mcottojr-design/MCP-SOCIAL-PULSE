/**
 * Metrics Normalizer Service
 * Standardizes metrics across different platforms (Meta, YouTube, etc.)
 * and calculates derived metrics like engagement rate.
 */

export interface NormalizedMetric {
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE';
  date: string;
  reach: number;
  impressions: number;
  views: number;
  engagements: number;
  engagementRate: number;
  watchTimeHours: number;
  linkClicks: number;
  followersGained: number;
}

export const metricsNormalizer = {
  /**
   * Normalizes Meta insights data
   */
  normalizeMeta(rawMeta: any, platform: 'FACEBOOK' | 'INSTAGRAM'): NormalizedMetric {
    const engagements = rawMeta.engagements || 0;
    const reach = rawMeta.reach || 1; // Avoid division by zero
    
    return {
      platform,
      date: new Date().toISOString().split('T')[0],
      reach: rawMeta.reach || 0,
      impressions: rawMeta.impressions || 0,
      views: rawMeta.impressions || 0, // Meta uses impressions as a proxy for views in many contexts
      engagements,
      engagementRate: (engagements / reach) * 100,
      watchTimeHours: 0, // Meta watch time is often separate
      linkClicks: rawMeta.link_clicks || 0,
      followersGained: rawMeta.followers_gained || 0,
    };
  },

  /**
   * Normalizes YouTube analytics data
   */
  normalizeYouTube(rawYouTube: any): NormalizedMetric {
    const views = rawYouTube.views || 1;
    const engagements = (rawYouTube.likes || 0) + (rawYouTube.comments || 0) + (rawYouTube.shares || 0);
    
    return {
      platform: 'YOUTUBE',
      date: new Date().toISOString().split('T')[0],
      reach: rawYouTube.views || 0, // YouTube uses views as reach in many contexts
      impressions: rawYouTube.impressions || 0,
      views: rawYouTube.views || 0,
      engagements,
      engagementRate: (engagements / views) * 100,
      watchTimeHours: (rawYouTube.watchTimeMinutes || 0) / 60,
      linkClicks: rawYouTube.annotationClickThroughRate || 0, // Placeholder
      followersGained: rawYouTube.subscribersGained || 0,
    };
  }
};
