/**
 * project-detail.js — renders project.html?id=<project-id> from data/projects.js.
 */
import { h, qs } from '../lib/dom.js';
import { site } from '../data/site.js';
import { projects, byId, CATEGORY_LABEL, STATUS_LABEL } from '../data/projects.js';
import { mockup } from '../components/mockup.js';
import { projectCard, detailUrl, statusBadge } from '../components/project-card.js';

const root = qs('#detail');
const id = new URLSearchParams(location.search).get('id');
const p = byId(id);

if (!p) {
  document.title = `Project not found | ${site.name}`;
  root.append(h('section', { class: 'not-found' },
    h('p', { class: 'eyebrow' }, '404'), h('h1', {}, 'Project not found'),
    h('p', { class: 'lede' }, 'That project link may be outdated.'),
    h('a', { class: 'button', href: 'projects.html' }, 'Browse all projects')));
} else {
  render(p);
}

function render(p) {
  document.title = `${p.title} | ${site.name}`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', p.summary);
  const i = projects.indexOf(p);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const { theme } = p.preview;
  const isConcept = p.status !== 'live';
  const mail = `mailto:${site.email}?subject=${encodeURIComponent(`About: ${p.title}`)}`;

  root.append(
    h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' }, h('a', { href: 'projects.html' }, 'Work'), ' / ', h('a', { href: `projects.html?filter=${p.category}` }, CATEGORY_LABEL[p.category]), ' / ', h('span', { 'aria-current': 'page' }, p.title)),

    h('header', { class: 'detail-head' },
      h('div', { class: 'pcard-labels' }, statusBadge(p), h('span', { class: 'pcard-cat' }, CATEGORY_LABEL[p.category])),
      h('h1', { class: 'reveal-3d' }, p.title),
      h('p', { class: 'lede' }, p.summary),
      h('div', { class: 'detail-cta' },
        p.demo ? h('a', { class: 'button', href: p.demo }, 'Open live demo ↗') : h('a', { class: 'button', href: mail }, 'Discuss a similar project'),
        h('a', { class: 'button outline', href: 'projects.html' }, '← All projects'))),

    h('div', { class: 'detail-stage', 'data-tilt': '', style: { '--accent-p': theme.accent } }, h('div', { class: 'detail-mock' }, mockup(p.preview, p.id, { label: `Large preview of ${p.title}` }))),

    h('dl', { class: 'facts' },
      fact('Type', STATUS_LABEL[p.status]),
      fact('Category', CATEGORY_LABEL[p.category]),
      fact('Platform', { mobile: 'Mobile app', web: 'Website / web app', desktop: 'Desktop web app' }[p.platform]),
      fact(isConcept ? 'Proposed tools' : 'Built with', p.tech.join(' · '))),

    h('div', { class: 'detail-grid' },
      h('section', { class: 'card' }, h('span', { class: 'tag' }, 'THE PROBLEM'), h('h2', {}, 'Why it matters'), h('p', {}, p.problem)),
      h('section', { class: 'card' }, h('span', { class: 'tag' }, isConcept ? 'DESIGN APPROACH' : 'HOW IT WAS BUILT'), h('h2', {}, 'Approach'), h('p', {}, p.approach))),

    h('section', { class: 'section' },
      h('p', { class: 'eyebrow' }, 'Key features'),
      h('ul', { class: 'feature-list' }, p.features.map((f, n) => h('li', { class: 'reveal' }, h('span', { class: 'fnum' }, String(n + 1).padStart(2, '0')), f)))),

    h('section', { class: 'section' },
      h('p', { class: 'eyebrow' }, 'Interface palette'),
      h('div', { class: 'palette-row' }, Object.entries(theme).map(([name, hex]) => h('div', { class: 'swatch-chip' }, h('i', { style: { background: hex } }), h('span', {}, name), h('code', {}, hex))))),

    h('div', { class: 'callout' }, h('p', {}, h('strong', {}, isConcept ? 'Honest note: ' : 'Live demo: '),
      isConcept
        ? 'this is a self-initiated concept to show design and planning skills. It is not client work and has not been built or launched.'
        : 'this project is built and working in this repository. It is a portfolio demo, not a commercial product, and it uses sample data.')),

    h('nav', { class: 'pager', 'aria-label': 'More projects' },
      h('a', { href: detailUrl(prev), class: 'pager-link' }, h('span', { class: 'muted small' }, '← Previous'), h('strong', {}, prev.title)),
      h('a', { href: detailUrl(next), class: 'pager-link next' }, h('span', { class: 'muted small' }, 'Next →'), h('strong', {}, next.title))),

    h('section', { class: 'section' }, h('p', { class: 'eyebrow' }, 'Related'), h('h2', {}, 'More in ', CATEGORY_LABEL[p.category]),
      h('div', { class: 'bento compact' }, projects.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3).map((x) => projectCard(x, { size: '' }))))
  );
  dispatchEvent(new Event('content-updated'));
}

function fact(k, v) { return h('div', {}, h('dt', {}, k), h('dd', {}, v)); }
