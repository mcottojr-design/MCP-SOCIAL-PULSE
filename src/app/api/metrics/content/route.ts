import { NextResponse } from 'next/server';

/**
 * Route: /api/metrics/content
 * Returns content performance metrics for the dashboard
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const accountId = searchParams.get('accountId');

  console.log(`[MetricsContent] Fetching content performance for platform: ${platform}, account: ${accountId}`);

  // Mock content performance data
  const mockContent = [
    {
      id: 'c1',
      title: 'Summer Vibes 2024',
      type: 'REEL',
      platform: 'INSTAGRAM',
      reach: 12500,
      impressions: 15400,
      views: 12500,
      engagements: 840,
      engagementRate: 6.7,
      watchTime: 45, // minutes
      linkClicks: 12,
      publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      thumbnail: 'https://picsum.photos/seed/c1/320/180',
    },
    {
      id: 'c2',
      title: 'Next.js 15 Tutorial: What\'s New?',
      type: 'VIDEO',
      platform: 'YOUTUBE',
      reach: 8200,
      impressions: 24500,
      views: 8200,
      engagements: 450,
      engagementRate: 5.5,
      watchTime: 1250, // minutes
      linkClicks: 84,
      publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      thumbnail: 'https://picsum.photos/seed/c2/320/180',
    },
    {
      id: 'c3',
      title: 'Product Launch Announcement',
      type: 'POST',
      platform: 'FACEBOOK',
      reach: 5400,
      impressions: 7200,
      views: 5400,
      engagements: 210,
      engagementRate: 3.9,
      watchTime: 0,
      linkClicks: 45,
      publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      thumbnail: 'https://picsum.photos/seed/c3/320/180',
    }
  ];

  return NextResponse.json(mockContent);
}
