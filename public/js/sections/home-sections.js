/**
 * home-sections.js — renders the data-driven home sections (featured, rails, skills,
 * process, case studies, experience, FAQ) and the scroll-linked 3D effects.
 */
import { h, qs } from '../lib/dom.js';
import { site } from '../data/site.js';
import { projects, byId, CATEGORY_LABEL } from '../data/projects.js';
import { featuredIds, tech, capabilities, process, caseStudies, experience, faq } from '../data/home.js';
import { mockup, isPhoneKind } from '../components/mockup.js';
import { projectCard, detailUrl, statusBadge } from '../components/project-card.js';
import { icon } from '../utils/icons.js';

export function renderHomeSections() {
  // ---- email links come from data/site.js (one place to edit) -------------------------
  document.querySelectorAll('[data-email-link]').forEach((a) => { a.href = `mailto:${site.email}`; });
  document.querySelectorAll('[data-email-text]').forEach((a) => { a.textContent = site.email; });

  // ---- hero stats (computed, never hard-coded) -------------------------------------------
  const live = projects.filter((p) => p.status === 'live').length;
  qs('#hero-stats')?.append(
    h('li', {}, h('b', {}, String(projects.length)), h('span', {}, 'Projects')),
    h('li', {}, h('b', {}, String(live)), h('span', {}, 'Live demos')),
    h('li', {}, h('b', {}, '0'), h('span', {}, 'Dependencies')));

  // ---- featured rows ----------------------------------------------------------------
  qs('#featured-list')?.append(...featuredIds.map(byId).filter(Boolean).map((p) => {
    const phone = isPhoneKind(p.preview.kind);
    return h('article', { class: 'feature-row' },
      h('a', { class: `fr-stage ${phone ? 'is-phone' : ''}`, href: detailUrl(p), 'data-scroll-tilt': '', style: { '--accent-p': p.preview.theme.accent }, 'aria-label': `${p.title}: view details` },
        h('div', { class: 'fr-mock' }, mockup(p.preview, p.id, { label: `Preview of ${p.title}` }))),
      h('div', { class: 'fr-copy' },
        h('div', { class: 'pcard-labels' }, statusBadge(p), h('span', { class: 'pcard-cat' }, CATEGORY_LABEL[p.category])),
        h('h3', { class: 'reveal-3d' }, p.title),
        h('p', {}, p.summary),
        h('ul', {}, p.features.slice(0, 3).map((f) => h('li', {}, f))),
        h('div', { class: 'hero-actions' },
          h('a', { class: 'button outline', href: detailUrl(p) }, 'Case details'),
          p.demo ? h('a', { class: 'button', href: p.demo }, 'Open live demo ↗') : null)));
  }));

  // ---- website rail -------------------------------------------------------------------
  const rail = qs('#web-rail');
  if (rail) {
    rail.append(...projects.filter((p) => p.category === 'web').map((p) => projectCard(p, { size: '' })));
    const step = () => (rail.firstElementChild?.getBoundingClientRect().width ?? 400) + 18;
    qs('#rail-prev')?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    qs('#rail-next')?.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  // ---- full-stack: live demos first ------------------------------------------------------
  const fs = projects.filter((p) => p.category === 'fullstack').sort((a, b) => (b.status === 'live') - (a.status === 'live')).slice(0, 6);
  qs('#fullstack-list')?.append(...fs.map((p) => projectCard(p, { size: '' })));

  // ---- skills ------------------------------------------------------------------------------
  qs('#capabilities')?.append(...capabilities.map((c) => h('article', { class: 'card cap reveal', 'data-tilt': '' }, icon(c.icon), h('h3', {}, c.title), h('p', {}, c.text))));
  qs('#tech-cloud')?.append(...tech.map((t, i) => {
    const tipId = `tech-tip-${i}`;
    const btn = h('button', { type: 'button', 'aria-describedby': tipId, 'aria-expanded': 'false' }, h('i', { class: `dot ${t.status}` }), t.name);
    btn.addEventListener('click', () => btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true')));
    btn.addEventListener('blur', () => btn.setAttribute('aria-expanded', 'false'));
    return h('li', { class: `tech ${t.status}` }, btn, h('span', { class: 'tech-tip', role: 'tooltip', id: tipId }, t.note));
  }));

  // ---- process ------------------------------------------------------------------------------
  qs('#process-track')?.append(...process.map((p, i) => h('li', { class: 'pstep' },
    h('div', { class: 'pnode' }, h('span', {}, String(i + 1).padStart(2, '0'))),
    h('div', { class: 'card', 'data-tilt': '' }, h('h3', {}, p.step), h('p', {}, p.text)))));

  // ---- case studies ---------------------------------------------------------------------------
  qs('#case-list')?.append(...caseStudies.map((c) => h('a', { class: 'card case-card reveal', href: c.href, 'data-tilt': '', style: { '--accent-p': c.preview.theme.accent } },
    h('div', { class: 'case-stage' }, mockup(c.preview, c.title, { label: `${c.title} preview` })),
    h('div', { class: 'case-body' }, h('span', { class: 'tag' }, c.tag.toUpperCase()), h('h3', {}, c.title), h('p', {}, c.text), h('span', { class: 'text-link' }, 'Read the case study →')))));

  // ---- experience --------------------------------------------------------------------------
  qs('#experience-list')?.append(...experience.filter((e) => !e.placeholder || site.showPlaceholders).map((e) => h('li', { class: `tl-item reveal ${e.placeholder ? 'placeholder' : ''}` },
    h('div', { class: 'tl-period' }, e.period),
    h('div', {}, e.placeholder ? h('span', { class: 'label concept', style: { marginBottom: '10px' } }, 'Placeholder') : null, h('h3', {}, e.role), h('div', { class: 'tl-org' }, e.org), h('p', {}, e.text)))));

  // ---- FAQ ------------------------------------------------------------------------------------
  qs('#faq-list')?.append(...faq.map((f, i) => h('details', { class: 'reveal', open: i === 0 }, h('summary', {}, f.q), h('p', {}, f.a))));

  dispatchEvent(new Event('content-updated'));
}

/**
 * Scroll-linked effects, computed in one rAF-throttled scroll handler:
 *  - featured mockups rotate from tilted to flat as they reach the middle of the screen (--sp)
 *  - the process line fills up and step nodes light up (--pp)
 */
export function initScrollEffects() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.pstep').forEach((s) => s.classList.add('lit'));
    qs('#process-track')?.style.setProperty('--pp', 1);
    return;
  }
  const tilts = [...document.querySelectorAll('[data-scroll-tilt]')];
  const track = qs('#process-track');
  const steps = [...document.querySelectorAll('.pstep')];
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const el of tilts) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const centre = r.top + r.height / 2;
      const sp = Math.max(0, Math.min(1, 1 - (centre - vh / 2) / (vh * 0.7)));
      el.style.setProperty('--sp', sp.toFixed(3));
    }
    if (track) {
      const r = track.getBoundingClientRect();
      const pp = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
      track.style.setProperty('--pp', pp.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle('lit', pp >= (i + 0.3) / steps.length));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}
