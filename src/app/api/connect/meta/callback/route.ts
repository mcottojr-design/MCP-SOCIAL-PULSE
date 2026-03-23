import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { exchangeMetaCode, fetchMetaPages, fetchInstagramAccounts } from '@/src/lib/providers/meta';

/**
 * Route: GET /api/connect/meta/callback
 * Handles the redirect from Meta after the admin grants OAuth permissions.
 * Exchanges the code for a long-lived token and upserts Account + OAuthConnection records.
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

  // --- Error from Meta ---
  if (error) {
    const reason = searchParams.get('error_description') ?? error;
    console.error('[MetaCallback] Meta returned an error:', reason);
    return NextResponse.redirect(`${appUrl}/settings?error=${encodeURIComponent(reason)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/settings?error=missing_oauth_code`);
  }

  // Optional CSRF check
  if (state !== 'socialpulse_meta') {
    return NextResponse.redirect(`${appUrl}/settings?error=invalid_state`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokens = await exchangeMetaCode(code);

    // 2. Fetch the admin's connected Facebook Pages
    const pages = await fetchMetaPages(tokens.access_token);

    for (const page of pages) {
      // 3. Upsert Account record for each connected Facebook Page
      const account = await prisma.account.upsert({
        where: { nativeId: page.id },
        create: {
          platform:    'FACEBOOK',
          nativeId:    page.id,
          name:        page.name,
          accessToken: page.access_token, // Page-scoped token
          expiresAt:   tokens.expires_at ? new Date(tokens.expires_at * 1000) : null,
          lastSyncedAt: null,
        },
        update: {
          name:        page.name,
          accessToken: page.access_token,
          expiresAt:   tokens.expires_at ? new Date(tokens.expires_at * 1000) : null,
        },
      });

      // Store the user-level token in OAuthConnection
      await prisma.oAuthConnection.upsert({
        where: { accountId: account.id },
        create: {
          accountId:    account.id,
          provider:     'FACEBOOK',
          accessToken:  tokens.access_token,
          refreshToken: null, // Meta uses long-lived tokens; no standard refresh
          expiresAt:    tokens.expires_at ? new Date(tokens.expires_at * 1000) : null,
          scopes:       tokens.scopes ?? [],
        },
        update: {
          accessToken: tokens.access_token,
          expiresAt:   tokens.expires_at ? new Date(tokens.expires_at * 1000) : null,
          scopes:      tokens.scopes ?? [],
        },
      });

      // 4. Also fetch and upsert linked Instagram Professional accounts
      const igAccounts = await fetchInstagramAccounts(page.id, page.access_token);
      for (const ig of igAccounts) {
        await prisma.account.upsert({
          where: { nativeId: ig.id },
          create: {
            platform:    'INSTAGRAM',
            nativeId:    ig.id,
            name:        ig.name,
            handle:      ig.username ? `@${ig.username}` : null,
            profileUrl:  ig.profile_picture_url ?? null,
            accessToken: page.access_token, // IG uses the parent Page token
          },
          update: {
            name:       ig.name,
            handle:     ig.username ? `@${ig.username}` : null,
            profileUrl: ig.profile_picture_url ?? null,
          },
        });
      }
    }

    console.log('[MetaCallback] Successfully connected Meta accounts.');
    return NextResponse.redirect(`${appUrl}/settings?success=meta_connected`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MetaCallback] Token exchange failed:', msg);
    return NextResponse.redirect(`${appUrl}/settings?error=${encodeURIComponent(msg)}`);
  }
}
