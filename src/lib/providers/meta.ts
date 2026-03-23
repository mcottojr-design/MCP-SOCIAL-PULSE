/**
 * Meta Graph API Provider
 * Server-side only — never imported from client components.
 *
 * Handles:
 * - OAuth code → long-lived token exchange
 * - Fetching connected Facebook Pages
 * - Fetching linked Instagram Professional accounts
 * - Refreshing long-lived tokens (60-day rotation)
 */

const META_GRAPH_BASE = 'https://graph.facebook.com/v20.0';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export interface MetaTokenResponse {
  access_token: string;
  token_type:   string;
  expires_in?:  number;   // Seconds from now (short-lived only)
  expires_at?:  number;   // Epoch seconds (long-lived)
  scopes?:      string[];
}

export interface MetaPage {
  id:           string;
  name:         string;
  access_token: string; // Page-scoped token
  category?:    string;
}

export interface MetaIGAccount {
  id:                  string;
  name:                string;
  username?:           string;
  profile_picture_url?: string;
}

// ----------------------------------------------------------------
// exchangeMetaCode
// Exchanges a short-lived code for a user access token, then
// immediately upgrades it to a 60-day long-lived token.
// ----------------------------------------------------------------
export async function exchangeMetaCode(code: string): Promise<MetaTokenResponse> {
  const clientId     = process.env.META_CLIENT_ID!;
  const clientSecret = process.env.META_CLIENT_SECRET!;
  const redirectUri  = process.env.META_REDIRECT_URI!;

  // Step 1: Short-lived user access token
  const shortParams = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    redirect_uri:  redirectUri,
    code,
  });

  const shortRes = await fetch(`${META_GRAPH_BASE}/oauth/access_token?${shortParams}`);
  if (!shortRes.ok) {
    const err = await shortRes.json();
    throw new Error(`Meta short token exchange failed: ${err?.error?.message ?? shortRes.statusText}`);
  }
  const shortToken: { access_token: string } = await shortRes.json();

  // Step 2: Upgrade to long-lived token (valid 60 days)
  const longParams = new URLSearchParams({
    grant_type:        'fb_exchange_token',
    client_id:         clientId,
    client_secret:     clientSecret,
    fb_exchange_token: shortToken.access_token,
  });

  const longRes = await fetch(`${META_GRAPH_BASE}/oauth/access_token?${longParams}`);
  if (!longRes.ok) {
    const err = await longRes.json();
    throw new Error(`Meta long-lived token exchange failed: ${err?.error?.message ?? longRes.statusText}`);
  }

  const longToken: MetaTokenResponse = await longRes.json();

  // Compute expires_at as an epoch timestamp
  if (longToken.expires_in && !longToken.expires_at) {
    longToken.expires_at = Math.floor(Date.now() / 1000) + longToken.expires_in;
  }

  // Fetch the list of granted scopes
  const inspectRes = await fetch(
    `${META_GRAPH_BASE}/me/permissions?access_token=${longToken.access_token}`
  );
  if (inspectRes.ok) {
    const { data } = await inspectRes.json();
    longToken.scopes = (data as Array<{ permission: string; status: string }>)
      .filter(p => p.status === 'granted')
      .map(p => p.permission);
  }

  return longToken;
}

// ----------------------------------------------------------------
// fetchMetaPages
// Returns all Facebook Pages the user manages, each with its own
// Page-scoped token.
// ----------------------------------------------------------------
export async function fetchMetaPages(userToken: string): Promise<MetaPage[]> {
  const res = await fetch(
    `${META_GRAPH_BASE}/me/accounts?fields=id,name,access_token,category&access_token=${userToken}`
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to fetch Meta pages: ${err?.error?.message ?? res.statusText}`);
  }
  const { data } = await res.json();
  return data as MetaPage[];
}

// ----------------------------------------------------------------
// fetchInstagramAccounts
// For a given Facebook Page, returns the linked Instagram Professional
// accounts (requires instagram_basic scope on the Page token).
// ----------------------------------------------------------------
export async function fetchInstagramAccounts(
  pageId: string,
  pageToken: string
): Promise<MetaIGAccount[]> {
  const res = await fetch(
    `${META_GRAPH_BASE}/${pageId}?fields=instagram_business_account{id,name,username,profile_picture_url}&access_token=${pageToken}`
  );
  if (!res.ok) return []; // Not all pages have linked IG accounts

  const data = await res.json();
  const igAccount = data?.instagram_business_account;
  return igAccount ? [igAccount] : [];
}

// ----------------------------------------------------------------
// refreshMetaToken
// Meta long-lived tokens (60-day) can be refreshed if they are
// at least 24h old. Call this from a cron job before expiry.
// ----------------------------------------------------------------
export async function refreshMetaToken(currentToken: string): Promise<MetaTokenResponse> {
  const clientId     = process.env.META_CLIENT_ID!;
  const clientSecret = process.env.META_CLIENT_SECRET!;

  const params = new URLSearchParams({
    grant_type:        'fb_exchange_token',
    client_id:         clientId,
    client_secret:     clientSecret,
    fb_exchange_token: currentToken,
  });

  const res = await fetch(`${META_GRAPH_BASE}/oauth/access_token?${params}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Meta token refresh failed: ${err?.error?.message ?? res.statusText}`);
  }

  const refreshed: MetaTokenResponse = await res.json();
  if (refreshed.expires_in && !refreshed.expires_at) {
    refreshed.expires_at = Math.floor(Date.now() / 1000) + refreshed.expires_in;
  }

  return refreshed;
}
