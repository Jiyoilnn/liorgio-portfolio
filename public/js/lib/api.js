/**
 * api.js — the front end's single doorway to the back end.
 *
 * Every page calls   api.get('products?sort=price-asc')   or   api.post('orders', {...}).
 * It decides at runtime how to answer:
 *
 *   LIVE MODE  — the Node server is reachable   -> real HTTP requests to /api/*
 *   DEMO MODE  — no server (e.g. GitHub Pages)  -> the same API is emulated in the browser
 *                                                   (see mock-api.js), data kept in localStorage.
 *
 * LESSON: hiding "where the data comes from" behind one small module means page code
 * never changes when you move from a static host to a real server.
 */
import { handle as mockHandle } from './mock-api.js';

export class ApiError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Optional: <meta name="api-base" content="https://my-api.example.com"> points the site at a separately hosted API.
const metaBase = document.querySelector('meta[name="api-base"]')?.content?.replace(/\/$/, '');
const BASE = metaBase || 'api';

let modePromise;

/** Resolves to 'live' or 'demo' (checked once, then cached). */
export function getMode() {
  modePromise ??= (async () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`${BASE}/health`, { signal: ctrl.signal });
      clearTimeout(timer);
      const json = await res.json(); // GitHub Pages answers with an HTML 404 page -> this throws -> demo mode
      return json.ok ? 'live' : 'demo';
    } catch {
      return 'demo';
    }
  })();
  return modePromise;
}

async function request(method, path, body, headers = {}) {
  if ((await getMode()) === 'demo') {
    const { status, body: data } = await mockHandle(method, path, body, headers);
    if (status >= 400) throw new ApiError(status, data.error, data.details);
    return data;
  }

  let res;
  try {
    res = await fetch(`${BASE}/${path}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Request failed.', data.details);
  return data;
}

export const api = {
  get: (path, headers) => request('GET', path, undefined, headers),
  post: (path, body, headers) => request('POST', path, body, headers),
  patch: (path, body, headers) => request('PATCH', path, body, headers),
};
