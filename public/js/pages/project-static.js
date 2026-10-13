/**
 * project-static.js — enhances a pre-rendered project page (project-<id>.html).
 * All the text is already in the HTML (good for SEO); JavaScript only adds the live
 * mockup preview and upgrades the "related" links into full cards.
 */
import { byId, projects } from '../data/projects.js';
import { mockup } from '../components/mockup.js';
import { projectCard } from '../components/project-card.js';

const root = document.getElementById('detail');
const p = byId(root?.dataset.projectId);
if (p) {
  document.getElementById('detail-mock')?.append(mockup(p.preview, p.id, { label: `Large preview of ${p.title}` }));
  const related = projects.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);
  document.getElementById('related')?.replaceChildren(...related.map((x) => projectCard(x, { size: '' })));
  dispatchEvent(new Event('content-updated'));
}
