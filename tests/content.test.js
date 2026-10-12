/** Content checks: the project data is valid and personal data rules are respected. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { projects } from '../public/js/data/projects.js';

const pub = new URL('../public/', import.meta.url).pathname;

test('there are 30+ projects with unique ids and valid fields', () => {
  assert.ok(projects.length >= 30);
  assert.equal(new Set(projects.map((p) => p.id)).size, projects.length);
  for (const p of projects) {
    assert.match(p.id, /^[a-z0-9-]+$/, p.id);
    assert.ok(['uiux', 'web', 'fullstack', 'lab'].includes(p.category), p.id);
    assert.ok(['concept', 'exploration', 'live'].includes(p.status), p.id);
    assert.ok(p.title && p.summary && p.problem && p.approach && p.features.length && p.tech.length, p.id);
    assert.ok(p.preview?.kind && p.preview.theme?.accent, p.id);
  }
});

test('only "live" projects link to a demo, and every demo page exists', () => {
  for (const p of projects) {
    if (p.status === 'live') assert.ok(p.demo && existsSync(join(pub, p.demo)), `${p.id} demo missing`);
    else assert.equal(p.demo, undefined, `${p.id} is not live but has a demo link`);
  }
});

test('no phone number anywhere in the public site', () => {
  const walk = (dir) => readdirSync(dir).flatMap((f) => {
    const full = join(dir, f);
    return statSync(full).isDirectory() ? walk(full) : /\.(html|js|css|json)$/.test(f) ? [full] : [];
  });
  for (const file of walk(pub)) {
    const text = readFileSync(file, 'utf8');
    assert.ok(!/tel:|69911505863/.test(text), `phone reference in ${file}`);
  }
});
