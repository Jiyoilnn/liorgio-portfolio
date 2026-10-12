/**
 * static.js — serves the front end from /public.
 *
 * LESSON (security): never join a user-supplied path onto a folder without checking
 * the result! "/../../etc/passwd" is called a path-traversal attack.
 */
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2',
};

export async function serveStatic(req, res, publicDir) {
  const { pathname } = new URL(req.url, 'http://localhost');
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return notFound(res); }

  const target = normalize(join(publicDir, rel));
  const insideRoot = target === publicDir || target.startsWith(publicDir + sep);
  const hasDotSegment = rel.split('/').some((seg) => seg.startsWith('.'));
  if (!insideRoot || hasDotSegment) return notFound(res);

  try {
    let file = target;
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      // HTML is revalidated every time; assets can be cached for an hour.
      'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    notFound(res);
  }
}

async function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 — Not found');
}
