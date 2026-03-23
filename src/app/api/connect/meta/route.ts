import { NextResponse } from 'next/server';

/**
 * Route: GET /api/connect/meta
 * Builds the Meta OAuth authorization URL and redirects the admin browser to it.
 * Scopes cover: Facebook Page insights + Instagram Professional account insights + media.
 */
export async function GET() {
  const clientId = process.env.META_CLIENT_ID;
  
  // Auto-calculate the redirect URI perfectly using Vercel's global vars
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  const appUrl = host ? `https://${host}` : 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/connect/meta/callback`;
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Meta OAuth is not configured. Set META_CLIENT_ID and META_REDIRECT_URI in .env.' },
      { status: 500 }
    );
  }

  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_read_user_content',
    'read_insights',
    'instagram_basic',
    'instagram_manage_insights',
    'instagram_content_publish', // needed for media insight reads
    'business_management',
  ].join(',');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state: 'socialpulse_meta', // Simple CSRF token; swap for crypto token in prod
  });

  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;

  console.log('[Meta OAuth] Redirecting to Meta authorization URL');
  return NextResponse.redirect(authUrl);
}
