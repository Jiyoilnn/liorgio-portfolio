/**
 * app.js — wires everything together into one Node http.Server.
 *
 * Request lifecycle (read this top to bottom!):
 *   1. security headers  ->  2. CORS  ->  3. rate limit  ->  4. router (/api/*) or static files
 *   Any error thrown along the way lands in the single catch block at the bottom,
 *   which turns it into a clean JSON response. That's "centralised error handling".
 */
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Store } from './db.js';
import { Router } from './router.js';
import { HttpError, sendJson, readJson } from './http-utils.js';
import { applySecurityHeaders, handleCors, createRateLimiter, logRequest } from './middleware.js';
import { serveStatic } from './static.js';
import { registerCatalog } from './routes/catalog.js';
import { registerOrders } from './routes/orders.js';
import { registerAnalytics } from './routes/analytics.js';
import { registerContact } from './routes/contact.js';
import { registerScores } from './routes/scores.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {object} [opts]
 * @param {string|null} [opts.dbFile]  path of db.json, or null for in-memory (tests)
 * @param {string} [opts.adminKey]
 * @param {string[]} [opts.corsOrigins]
 * @param {boolean} [opts.quiet]       silence request logs (tests)
 */
export async function createApp({
  dbFile = join(root, 'server/data/db.json'),
  adminKey = process.env.ADMIN_KEY ?? 'demo-admin',
  corsOrigins = (process.env.CORS_ORIGIN ?? '').split(',').filter(Boolean),
  quiet = false,
  rateLimit = { windowMs: 60_000, max: 120 },
} = {}) {
  const publicDir = join(root, 'public');
  const store = await new Store({ file: dbFile, seedFile: join(publicDir, 'data/seed.json') }).init();

  const router = new Router();
  router.get('/api/health', () => ({ body: { ok: true, uptime: Math.round(process.uptime()) } }));
  const ctx = { store, adminKey };
  registerCatalog(router, ctx);
  registerOrders(router, ctx);
  registerAnalytics(router, ctx);
  registerContact(router, ctx);
  registerScores(router, ctx);

  const generalLimit = createRateLimiter(rateLimit);
  // Writes (POST/PATCH) get a much tighter limit than reads.
  const writeLimit = createRateLimiter({ windowMs: rateLimit.windowMs, max: Math.max(5, Math.floor(rateLimit.max / 6)) });

  const server = createServer(async (req, res) => {
    if (!quiet) logRequest(req, res, Date.now());
    applySecurityHeaders(res);
    try {
      if (handleCors(req, res, corsOrigins)) return;

      const url = new URL(req.url, 'http://localhost');
      const ip = req.socket.remoteAddress ?? 'unknown';

      if (!url.pathname.startsWith('/api/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
        return await serveStatic(req, res, publicDir);
      }

      generalLimit(ip);
      if (req.method !== 'GET') writeLimit(ip);

      const match = router.match(req.method, url.pathname);
      if (!match) throw new HttpError(404, 'Route not found.');
      if (match.methodNotAllowed) throw new HttpError(405, 'Method not allowed.');

      // The body is parsed lazily (only when a handler asks for it) and cached.
      let cached;
      const body = () => (cached ??= readJson(req));

      const result = await match.handler({ req, res, params: match.params, query: url.searchParams, body });
      sendJson(res, result.status ?? 200, result.body);
    } catch (err) {
      if (err instanceof HttpError) {
        const headers = err.status === 429 ? { 'Retry-After': String(err.details?.retryAfter ?? 60) } : {};
        const payload = { error: err.message };
        if (err.details && err.status !== 429) payload.details = err.details;
        return sendJson(res, err.status, payload, headers);
      }
      console.error(err); // unexpected bug: log it, but never leak internals to the client
      sendJson(res, 500, { error: 'Something went wrong on our side.' });
    }
  });

  server.on('close', () => { generalLimit.stop(); writeLimit.stop(); });
  return { server, store };
}
