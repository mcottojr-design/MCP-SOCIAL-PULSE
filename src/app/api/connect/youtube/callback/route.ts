import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { exchangeGoogleCode, fetchYouTubeChannel } from '@/src/lib/providers/youtube';

/**
 * Route: GET /api/connect/youtube/callback
 * Handles the redirect from Google after the admin grants YouTube API permissions.
 * Exchanges the code for access + refresh tokens and upserts Account + OAuthConnection records.
 */
export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const { searchParams } = reqUrl;
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Vercel routes traffic through a proxy, so the internal node URL is always localhost.
  // We MUST read the x-forwarded-host header to get the real domain.
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const appUrl = host ? `${proto}://${host}` : 'http://localhost:3000';

  // --- Error from Google ---
  if (error) {
    console.error('[YouTubeCallback] Google returned an error:', error);
    return NextResponse.redirect(`${appUrl}/settings?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/settings?error=missing_oauth_code`);
  }

  if (state !== 'socialpulse_youtube') {
    return NextResponse.redirect(`${appUrl}/settings?error=invalid_state`);
  }

  try {
    // 1. Exchange authorization code for access + refresh tokens
    const tokens = await exchangeGoogleCode(code);

    // 2. Fetch the connected YouTube channel info using the access token
    const channel = await fetchYouTubeChannel(tokens.access_token);

    if (!channel) {
      return NextResponse.redirect(`${appUrl}/settings?error=no_youtube_channel_found`);
    }

    // 3. Upsert Account record for the YouTube channel
    const account = await prisma.account.upsert({
      where: { nativeId: channel.id },
      create: {
        platform:     'YOUTUBE',
        nativeId:     channel.id,
        name:         channel.snippet.title,
        handle:       channel.snippet.customUrl ?? null,
        profileUrl:   channel.snippet.thumbnails?.default?.url ?? null,
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt:    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        lastSyncedAt: null,
      },
      update: {
        name:         channel.snippet.title,
        handle:       channel.snippet.customUrl ?? null,
        profileUrl:   channel.snippet.thumbnails?.default?.url ?? null,
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt:    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    // 4. Persist tokens in OAuthConnection for secure server-side access
    await prisma.oAuthConnection.upsert({
      where: { accountId: account.id },
      create: {
        accountId:    account.id,
        provider:     'YOUTUBE',
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt:    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes:       tokens.scope ? tokens.scope.split(' ') : [],
      },
      update: {
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt:    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes:       tokens.scope ? tokens.scope.split(' ') : [],
      },
    });

    console.log(`[YouTubeCallback] Successfully connected channel: ${channel.snippet.title}`);
    return NextResponse.redirect(`${appUrl}/settings?success=youtube_connected`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[YouTubeCallback] Token exchange failed:', msg);
    return NextResponse.redirect(`${appUrl}/settings?error=${encodeURIComponent(msg)}`);
  }
}
