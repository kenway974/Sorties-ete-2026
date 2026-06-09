import { NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// In-memory store per Vercel serverless instance.
// For multi-instance prod, swap to an Upstash/Redis store.
const store = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

/**
 * Returns a 429 NextResponse when the caller exceeds the limit,
 * or null when the request is allowed.
 */
export function rateLimit(
  key: string,
  { limit, windowSecs }: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSecs * 1000 });
    return null;
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Trop de requêtes, veuillez réessayer plus tard." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count += 1;
  return null;
}

/** Extract a stable key from a request (IP or header fallback). */
export function getRateLimitKey(request: Request, suffix = ""): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return suffix ? `${ip}:${suffix}` : ip;
}
