import { NextResponse } from 'next/server';

/**
 * Route: GET /api/connect/youtube
 * Builds the Google OAuth 2.0 authorization URL and redirects the admin to it.
 * Scopes cover: YouTube Data API (channel/video metadata) + YouTube Analytics API.
 */
export async function GET() {
  const clientId    = process.env.YOUTUBE_CLIENT_ID;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'YouTube OAuth is not configured. Set YOUTUBE_CLIENT_ID and YOUTUBE_REDIRECT_URI in .env.' },
      { status: 500 }
    );
  }

  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
  ].join(' ');

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         scopes,
    access_type:   'offline',   // Request a refresh token
    prompt:        'consent',   // Force re-consent to always get refresh_token
    state:         'socialpulse_youtube',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  console.log('[YouTube OAuth] Redirecting to Google authorization URL');
  return NextResponse.redirect(authUrl);
}
