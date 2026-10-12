/**
 * data/home.js — content for the home page sections. Edit text here, not in HTML.
 */

/** Big featured projects (ids from data/projects.js), in display order. */
export const featuredIds = ['friesta-ordering', 'pulse-saas-dashboard', 'maison-noir-fashion', 'business-analytics'];

/**
 * Skills. `status`:
 *   'core'        -> confirmed skills you listed yourself (HTML, CSS, JavaScript, UI design)
 *   'demo'        -> used to build the demos in this repository (you're learning them by doing)
 */
export const tech = [
  { name: 'HTML', status: 'core', note: 'Semantic, accessible markup on every page.' },
  { name: 'CSS', status: 'core', note: 'Design tokens, Grid, 3D transforms, container queries.' },
  { name: 'JavaScript', status: 'core', note: 'ES modules, DOM, fetch, canvas.' },
  { name: 'UI Design', status: 'core', note: 'Layouts, type, colour and components.' },
  { name: 'Figma', status: 'core', note: 'Designing interfaces and prototypes.' },
  { name: 'React', status: 'core', note: 'Component-based front ends.' },
  { name: 'TypeScript', status: 'core', note: 'Typed, safer JavaScript.' },
  { name: 'SQL databases', status: 'core', note: 'Structured data and queries.' },
  { name: 'Node.js', status: 'demo', note: 'The zero-dependency API behind the demos.' },
  { name: 'REST APIs', status: 'demo', note: 'Orders, analytics, leaderboards.' },
  { name: 'Canvas 3D', status: 'demo', note: 'A hand-written mini 3D engine.' },
  { name: 'Git & GitHub Actions', status: 'demo', note: 'CI tests and Pages deployment.' },
  { name: 'Automated testing', status: 'demo', note: 'node:test integration and unit tests.' },
];

/** Capability areas (what you focus on, not years of experience). */
export const capabilities = [
  { title: 'User interface design', text: 'Clear hierarchy, considered type and colour, components that feel crafted.', icon: 'ui' },
  { title: 'User experience design', text: 'Flows built around what people are trying to do, with fewer steps and less guessing.', icon: 'ux' },
  { title: 'Responsive web design', text: 'Layouts that adapt from phone to wide desktop without breaking.', icon: 'resp' },
  { title: 'Design systems', text: 'Tokens and reusable components so every page feels related.', icon: 'sys' },
  { title: 'Prototyping & wireframing', text: 'From rough boxes to clickable flows before code is written.', icon: 'wire' },
  { title: 'Front-end development', text: 'Semantic HTML, modern CSS and modular JavaScript.', icon: 'fe' },
  { title: 'Back-end development', text: 'APIs with validation, error handling and security headers.', icon: 'be' },
  { title: 'API integration', text: 'One API client, live and offline modes, honest error states.', icon: 'api' },
  { title: 'Database design', text: 'Data shapes that keep business rules simple and safe.', icon: 'db' },
  { title: 'Performance', text: 'Zero dependencies, lazy rendering, animations that pause off-screen.', icon: 'perf' },
  { title: 'Accessibility', text: 'Keyboard support, contrast checks, reduced-motion support, alt text.', icon: 'a11y' },
  { title: 'Version control & deployment', text: 'Git workflows, CI tests and automated GitHub Pages deploys.', icon: 'git' },
];

export const process = [
  { step: 'Discover', text: 'Understand the goal, the audience and the constraints. Ask "what does success look like?"' },
  { step: 'Define', text: 'Turn findings into user flows, content structure and a clear scope.' },
  { step: 'Design', text: 'Wireframes first, then a visual system: type, colour, components, motion.' },
  { step: 'Build', text: 'Semantic, modular front end and a validated back end that never trusts the client.' },
  { step: 'Test', text: 'Automated tests, keyboard and screen-reader checks, real devices, slow connections.' },
  { step: 'Launch', text: 'Deploy, measure, and keep improving based on real feedback.' },
];

export const caseStudies = [
  { href: 'case-study.html', tag: 'Architecture', title: 'Building a full-stack portfolio with zero dependencies', text: 'How one API client serves both a real Node server and an offline demo mode, and the bug the tests caught.', preview: { kind: 'site-saas', brand: 'Portfolio', headline: 'One codebase, two modes.', theme: { bg: '#0b0b0c', fg: '#f4f4f4', accent: '#ffd400', surface: '#161617' }, hue: 50 } },
  { href: 'project.html?id=friesta-ordering', tag: 'Full-stack', title: 'Friesta: an ordering flow you can actually use', text: 'Menu API, server-side pricing, promo rules and a 3D carton drawn by a hand-made engine.', preview: { kind: 'order-board', brand: 'Friesta', headline: 'Orders', theme: { bg: '#140d0b', fg: '#fff3ec', accent: '#ff6b3d', surface: '#22140f' }, hue: 8 } },
  { href: 'research.html', tag: 'Research', title: 'What makes a website feel professional?', text: 'Hierarchy, contrast, consistency, purposeful motion: notes applied to this site.', preview: { kind: 'site-editorial', brand: 'NOTES', headline: 'Designing for trust', theme: { bg: '#f6f4ef', fg: '#17171a', accent: '#c2410c', surface: '#ffffff' }, hue: 28 } },
];

/**
 * Experience. Add a new object for each role, internship, course or programme.
 */
export const experience = [
  { period: '2026 — Present', role: 'Self-directed web design & development', org: 'Independent', text: 'Designing and building the projects in this portfolio: interface concepts, a Node.js API, automated tests and GitHub Pages deployment.', placeholder: false },
];

export const faq = [
  { q: 'Are these real client projects?', a: 'No. Each project is labelled. "Live Demo" projects are built and working in this portfolio. "Concept Project" and "UI/UX Exploration" items are self-initiated design studies that show how I think. None are presented as client work.' },
  { q: 'What can you help with?', a: 'Interface and UX design for websites and apps, responsive front-end development, and small full-stack builds such as ordering flows, dashboards and APIs.' },
  { q: 'Can I see the code?', a: 'Yes. The whole portfolio, including the Node.js API and the tests, is in my GitHub repository.' },
  { q: 'How do you approach a new project?', a: 'Discover, define, design, build, test, launch. The process section above explains each step.' },
  { q: 'What is the best way to contact you?', a: 'Email. Use the button below or copy my address.' },
];
