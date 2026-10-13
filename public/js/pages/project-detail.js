/**
 * project-detail.js — keeps old links like project.html?id=<id> working by sending
 * visitors to the project's own pre-rendered page (project-<id>.html).
 */
import { h, qs } from '../lib/dom.js';
import { byId } from '../data/projects.js';

const p = byId(new URLSearchParams(location.search).get('id'));
if (p) {
  location.replace(`project-${p.id}.html`);
} else {
  qs('#detail').append(h('section', { class: 'not-found' },
    h('p', { class: 'eyebrow' }, '404'), h('h1', {}, 'Project not found'),
    h('p', { class: 'lede' }, 'That project link may be outdated.'),
    h('a', { class: 'button', href: 'projects.html' }, 'Browse all projects')));
}
