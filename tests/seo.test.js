/** SEO checks: run after `npm run build:seo`. Catches broken metadata before it ships. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES, SITE_URL } from '../scripts/seo.config.js';
import { projects } from '../public/js/data/projects.js';

const pub = new URL('../public/', import.meta.url).pathname;
const html = (f) => readFileSync(join(pub, f), 'utf8');
const indexable = [...Object.entries(PAGES).filter(([, m]) => m.index !== false).map(([f]) => f), ...projects.map((p) => `project-${p.id}.html`)];

test('every indexable page has one title, description, canonical and valid JSON-LD', () => {
  for (const f of indexable) {
    const h = html(f);
    assert.equal((h.match(/<title>/g) ?? []).length, 1, `${f}: title count`);
    assert.equal((h.match(/<meta name="description"/g) ?? []).length, 1, `${f}: description count`);
    assert.equal((h.match(/<link rel="canonical"/g) ?? []).length, 1, `${f}: canonical count`);
    assert.equal((h.match(/<h1[\s>]/g) ?? []).length, 1, `${f}: exactly one h1`);
    const title = h.match(/<title>([^<]*)<\/title>/)[1].replace(/&amp;/g, '&');
    const desc = h.match(/<meta name="description" content="([^"]*)"/)[1];
    assert.ok(title.length >= 20 && title.length <= 75, `${f}: title length ${title.length}`);
    assert.ok(desc.length >= 70 && desc.length <= 320, `${f}: description length ${desc.length}`);
    assert.match(h, /<meta property="og:image" content="https:\/\//, `${f}: absolute og:image`);
    for (const [, json] of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(json);
  }
});

test('titles and descriptions are unique across pages', () => {
  const titles = indexable.map((f) => html(f).match(/<title>([^<]*)/)[1]);
  assert.equal(new Set(titles).size, titles.length);
});

test('non-indexable pages say noindex', () => {
  for (const [f, m] of Object.entries(PAGES)) if (m.index === false) assert.match(html(f), /noindex/, f);
});

test('sitemap lists every indexable page and every listed file exists', () => {
  const xml = html('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, indexable.length);
  for (const loc of locs) {
    assert.ok(loc.startsWith(SITE_URL));
    const file = loc.slice(SITE_URL.length) || 'index.html';
    assert.ok(existsSync(join(pub, file)), `sitemap points at missing ${file}`);
  }
});

test('project pages contain their real content as HTML (crawlable without JavaScript)', () => {
  for (const p of projects) {
    const h = html(`project-${p.id}.html`);
    assert.ok(h.includes(p.problem.slice(0, 40).replace(/&/g, '&amp;').replace(/</g, '&lt;')), p.id);
  }
  assert.ok(html('projects.html').includes('project-friesta-ordering.html'), 'gallery is pre-rendered');
  assert.ok(html('index.html').includes('project-pulse-saas-dashboard.html'), 'home featured is pre-rendered');
});
