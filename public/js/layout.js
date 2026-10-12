/**
 * layout.js — loaded by EVERY page.
 * Builds the shared header + footer from data/site.js and switches on site-wide
 * behaviour: sticky nav state, mobile menu, scroll-spy, reveal animations, 3D tilt,
 * copy-email buttons and the live/demo API badge.
 */
import { h, qs, qsa } from './lib/dom.js';
import { site, nav } from './data/site.js';
import { initTilt } from './lib/tilt.js';
import { getMode } from './lib/api.js';
import { initCopyEmail } from './components/copy-email.js';

const file = location.pathname.split('/').pop() || 'index.html';
const isHome = file === 'index.html' || file === '';
// "#about" works on the home page; everywhere else it must point back to index.html#about.
const resolve = (href) => (href.startsWith('#') && !isHome ? `index.html${href}` : href);
const isWorkPage = document.body.dataset.section === 'work';

function buildHeader() {
  const links = h('nav', { class: 'nav-links', id: 'nav-links', 'aria-label': 'Main' },
    nav.map(({ href, label }) => {
      const active = href === file || (href === 'projects.html' && isWorkPage);
      return h('a', { href: resolve(href), class: active ? 'active' : null, 'aria-current': active ? 'page' : null, dataset: { spy: href.startsWith('#') ? href.slice(1) : '' } }, label);
    }),
    h('a', { href: `mailto:${site.email}`, class: 'mobile-only' }, 'Email me ↗'));

  const toggle = h('button', { class: 'nav-toggle', type: 'button', 'aria-label': 'Open menu', 'aria-expanded': 'false', 'aria-controls': 'nav-links' }, h('span'), h('span'), h('span'));
  const setOpen = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && links.classList.contains('open')) { setOpen(false); toggle.focus(); } });

  return h('header', { class: `site-nav${isHome ? '' : ' solid'}` },
    h('div', { class: 'container nav-inner' },
      h('a', { class: 'logo', href: 'index.html', 'aria-label': `${site.name}, home` }, h('span', { class: 'logo-mark', 'aria-hidden': 'true' }, 'L'), h('span', {}, site.firstName, h('b', {}, '.'))),
      links,
      h('a', { class: 'button nav-cta', href: `mailto:${site.email}` }, 'Email me'),
      toggle),
    h('div', { class: 'scroll-progress', 'aria-hidden': 'true' }));
}

function buildFooter() {
  const socials = site.socials.filter((s) => s.url);
  return h('div', { class: 'container footer-inner' },
    h('span', {}, `© ${site.year} ${site.name}. Designed & built by hand.`),
    h('div', { class: 'footer-links' },
      h('a', { href: `mailto:${site.email}` }, 'Email'),
      socials.map((s) => h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.label)),
      h('a', { href: 'projects.html' }, 'Work'),
      h('a', { href: '#main' }, 'Back to top ↑')),
    h('span', { class: 'mode-badge', id: 'mode-badge', title: 'Where the demo data comes from' }, 'checking API…'));
}

qs('#site-header')?.replaceWith(buildHeader());
qs('#site-footer')?.replaceChildren(buildFooter());
document.body.prepend(h('a', { class: 'skip-link', href: '#main' }, 'Skip to content'));

// ---- nav background + scroll progress ------------------------------------------------
const header = qs('.site-nav');
const bar = qs('.scroll-progress');
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar?.style.setProperty('--p', max > 0 ? `${(scrollY / max) * 100}%` : '0%');
  header?.classList.toggle('scrolled', scrollY > 24);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- scroll-spy: highlight the nav item of the section on screen (home page only) ----------
if (isHome && 'IntersectionObserver' in window) {
  const spyLinks = qsa('[data-spy]').filter((a) => a.dataset.spy);
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      spyLinks.forEach((a) => a.classList.toggle('active', a.dataset.spy === e.target.id));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  spyLinks.forEach((a) => { const s = document.getElementById(a.dataset.spy); if (s) spy.observe(s); });
}

// ---- reveal-on-scroll -------------------------------------------------------------------
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = !reduced && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  : null;

function initReveal() {
  qsa('.reveal:not([data-rv]), .reveal-3d:not([data-rv])').forEach((el, i) => {
    el.dataset.rv = '';
    if (!io) return el.classList.add('in');
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });
}

initReveal();
initTilt();
initCopyEmail();

// Pages that render content later (after fetching data) dispatch this event.
addEventListener('content-updated', () => { initReveal(); initTilt(); initCopyEmail(); });

// Only pages that talk to the API probe it (no pointless 404s on static pages).
if (document.body.dataset.api === undefined) qs('#mode-badge')?.remove();
else getMode().then((mode) => {
  const badge = qs('#mode-badge');
  if (!badge) return;
  badge.textContent = mode === 'live' ? '● Live API' : '● Demo mode (browser)';
  badge.dataset.mode = mode;
});
