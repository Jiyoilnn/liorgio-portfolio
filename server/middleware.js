/**
 * middleware.js — cross-cutting concerns: security headers, CORS, rate limiting, logging.
 */
import { HttpError } from './http-utils.js';

/** Headers that make browsers refuse risky behaviour (inline scripts, framing, sniffing…). */
export function applySecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

/**
 * CORS lets a page hosted on ANOTHER origin (e.g. GitHub Pages) call this API.
 * Only origins listed in the CORS_ORIGIN env var are allowed. Returns true if the
 * request was a preflight (OPTIONS) that we already answered.
 */
export function handleCors(req, res, allowedOrigins) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Key');
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}

/**
 * Fixed-window rate limiter: at most `max` hits per `windowMs` per client IP.
 * LESSON: without this, one script could spam your contact form or order endpoint.
 */
export function createRateLimiter({ windowMs = 60_000, max = 60 } = {}) {
  const hits = new Map(); // ip -> { count, resetAt }
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [ip, h] of hits) if (h.resetAt <= now) hits.delete(ip);
  }, windowMs);
  sweeper.unref(); // don't keep the process alive just for cleanup

  function check(ip) {
    const now = Date.now();
    let h = hits.get(ip);
    if (!h || h.resetAt <= now) { h = { count: 0, resetAt: now + windowMs }; hits.set(ip, h); }
    h.count += 1;
    if (h.count > max) {
      throw new HttpError(429, 'Too many requests. Please slow down.', { retryAfter: Math.ceil((h.resetAt - now) / 1000) });
    }
  }
  check.stop = () => clearInterval(sweeper);
  return check;
}

/** One line per request: METHOD /path -> status (ms). */
export function logRequest(req, res, start) {
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.url} -> ${res.statusCode} (${ms}ms)`);
  });
}
