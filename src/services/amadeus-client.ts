/**
 * Centralized Amadeus Self-Service API Client
 * Handles token management, rate limiting, and base request utilities.
 * Auto-detects test vs production based on NODE_ENV.
 */

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

// Use test API in development (local credentials), production API on Vercel
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const AMADEUS_BASE = IS_PRODUCTION
  ? "https://api.amadeus.com"
  : "https://test.api.amadeus.com";

// ─── Token Cache ──────────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getAmadeusToken(): Promise<string | null> {
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    console.warn("Amadeus credentials not configured");
    return null;
  }
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  try {
    const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
    });
    const data = await res.json();
    if (data.access_token) {
      cachedToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return cachedToken;
    }
    console.error("Amadeus token response missing access_token:", data);
    return null;
  } catch (e) {
    console.error("Amadeus token error:", e);
    return null;
  }
}

// ─── GET helper ───────────────────────────────────────────────────────────────
export async function amadeusGet<T = unknown>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<{ data: T[]; meta?: Record<string, unknown> } | null> {
  const token = await getAmadeusToken();
  if (!token) return null;

  const url = new URL(`${AMADEUS_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`Amadeus GET ${path} [${res.status}]:`, JSON.stringify(err).slice(0, 500));
      return null;
    }

    return await res.json();
  } catch (e) {
    console.error(`Amadeus GET ${path} error:`, e);
    return null;
  }
}

// ─── POST helper ──────────────────────────────────────────────────────────────
export async function amadeusPost<T = unknown>(
  path: string,
  body: unknown
): Promise<{ data: T; dictionaries?: Record<string, unknown> } | null> {
  const token = await getAmadeusToken();
  if (!token) return null;

  try {
    const res = await fetch(`${AMADEUS_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`Amadeus POST ${path} [${res.status}]:`, JSON.stringify(err).slice(0, 500));
      return null;
    }

    return await res.json();
  } catch (e) {
    console.error(`Amadeus POST ${path} error:`, e);
    return null;
  }
}

// ─── Date Utilities ───────────────────────────────────────────────────────────
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDefaultCheckIn(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return formatDate(d);
}

export function getDefaultCheckOut(): string {
  const d = new Date();
  d.setDate(d.getDate() + 8);
  return formatDate(d);
}

export { AMADEUS_BASE };
