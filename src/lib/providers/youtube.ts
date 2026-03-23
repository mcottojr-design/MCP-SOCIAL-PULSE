/**
 * Google / YouTube API Provider
 * Server-side only — never imported from client components.
 *
 * Handles:
 * - OAuth code → access + refresh token exchange
 * - Auto-refresh of expired access tokens using refresh_token
 * - Fetching connected YouTube channel metadata
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export interface GoogleTokenResponse {
  access_token:  string;
  refresh_token?: string;
  expires_in:    number;
  expiry_date?:  number; // Computed: Date.now() + expires_in * 1000
  token_type:    string;
  scope?:        string;
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title:         string;
    description?:  string;
    customUrl?:    string;
    publishedAt?:  string;
    country?:      string;
    thumbnails?: {
      default?: { url: string };
      medium?:  { url: string };
      high?:    { url: string };
    };
  };
  statistics?: {
    viewCount?:            string;
    subscriberCount?:      string;
    hiddenSubscriberCount?: boolean;
    videoCount?:           string;
  };
}

// ----------------------------------------------------------------
// exchangeGoogleCode
// Exchanges an authorization code for access + refresh tokens.
// Requires access_type=offline and prompt=consent from the auth URL.
// ----------------------------------------------------------------
export async function exchangeGoogleCode(code: string, appUrl: string): Promise<GoogleTokenResponse> {
  const clientId     = process.env.YOUTUBE_CLIENT_ID!;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!;
  const redirectUri  = `${appUrl}/api/connect/youtube/callback`;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Google token exchange failed: ${err?.error_description ?? err?.error ?? res.statusText}`);
  }

  const tokens: GoogleTokenResponse = await res.json();

  // Store computed expiry as a timestamp for easy comparison
  tokens.expiry_date = Date.now() + tokens.expires_in * 1000;

  return tokens;
}

// ----------------------------------------------------------------
// refreshGoogleToken
// Uses the stored refresh_token to obtain a new access_token when
// the current one is expired or about to expire.
// ----------------------------------------------------------------
export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const clientId     = process.env.YOUTUBE_CLIENT_ID!;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Google token refresh failed: ${err?.error_description ?? err?.error ?? res.statusText}`);
  }

  const tokens: GoogleTokenResponse = await res.json();
  tokens.expiry_date = Date.now() + tokens.expires_in * 1000;
  return tokens;
}

// ----------------------------------------------------------------
// getValidAccessToken
// Returns a fresh access_token for an account, auto-refreshing if
// the stored token is expired or within 5 minutes of expiry.
// Persists the refreshed token back to the database.
// ----------------------------------------------------------------
export async function getValidYouTubeToken(accountId: string): Promise<string> {
  const { prisma } = await import('@/src/lib/prisma');

  const conn = await prisma.oAuthConnection.findUnique({ where: { accountId } });
  if (!conn) throw new Error(`No OAuth connection found for account ${accountId}`);

  const FIVE_MINUTES = 5 * 60 * 1000;
  const isExpired = conn.expiresAt
    ? conn.expiresAt.getTime() - Date.now() < FIVE_MINUTES
    : false;

  if (!isExpired) return conn.accessToken;

  if (!conn.refreshToken) {
    throw new Error(`YouTube access token expired and no refresh token stored for account ${accountId}`);
  }

  console.log(`[YouTube] Refreshing access token for account ${accountId}`);
  const newTokens = await refreshGoogleToken(conn.refreshToken);

  await prisma.oAuthConnection.update({
    where: { accountId },
    data: {
      accessToken: newTokens.access_token,
      expiresAt:   newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
    },
  });

  await prisma.account.update({
    where: { id: accountId },
    data: { accessToken: newTokens.access_token },
  });

  return newTokens.access_token;
}

// ----------------------------------------------------------------
// fetchYouTubeChannel
// Fetches the authenticated user's YouTube channel (snippet + statistics).
// ----------------------------------------------------------------
export async function fetchYouTubeChannel(accessToken: string): Promise<YouTubeChannel | null> {
  const params = new URLSearchParams({
    part:  'snippet,statistics',
    mine:  'true',
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to fetch YouTube channel: ${err?.error?.message ?? res.statusText}`);
  }

  const { items } = await res.json();
  return items?.[0] ?? null;
}
