/**
 * seo.config.js — every SEO setting for the site, in one place.
 * After editing, run:  npm run build:seo   (CI also runs it before every deploy)
 */
export const SITE_URL = 'https://jiyoilnn.github.io/liorgio-portfolio/'; // must end with "/"
export const SITE_NAME = 'Liorgio Ilanan — Web Designer & Developer';
export const LOCALE = 'en_PH';
export const OG_IMAGE = 'assets/og-image.png';           // 1200×630, used for link previews
export const TWITTER_HANDLE = '';                         // e.g. '@liorgio' (optional)

// Paste ONLY the content value of Google Search Console's "HTML tag" verification here.
export const GOOGLE_SITE_VERIFICATION = '';
export const BING_SITE_VERIFICATION = '';

export const PERSON = {
  name: 'Liorgio Ilanan',
  jobTitle: 'Web Designer & Developer',
  description: 'Web designer and developer from Caloocan, Philippines, building interactive websites, UI/UX concepts and full-stack web apps.',
  email: 'ilananliorgio@gmail.com',
  image: 'assets/img/portrait-bust.webp',
  locality: 'Caloocan City', region: 'Metro Manila', country: 'PH',
  school: 'Our Lady of Fatima University',
  sameAs: ['https://www.linkedin.com/in/liorgio-i-025262360', 'https://github.com/Jiyoilnn'],
  knowsAbout: ['Web design', 'Web development', 'UI/UX design', 'Responsive web design', 'HTML', 'CSS', 'JavaScript', 'Node.js', 'React', 'TypeScript', 'Figma', 'SQL', 'Accessibility', 'Search engine optimization'],
};

/**
 * Per-page metadata. Titles ≈ 50–60 characters, descriptions ≈ 140–160, primary
 * keyword first, brand last. `index: false` keeps a page out of search results.
 */
export const PAGES = {
  'index.html': {
    title: 'Liorgio Ilanan — Web Designer & Developer in Caloocan, Philippines',
    description: 'Portfolio of Liorgio Ilanan, a web designer and developer in Caloocan, Philippines. 34 projects: UI/UX design, websites and full-stack web apps.',
    type: 'profile', priority: 1.0, changefreq: 'weekly',
  },
  'projects.html': {
    title: 'Web Design & Development Projects | Liorgio Ilanan',
    description: '34 web design and development projects by Liorgio Ilanan: UI/UX case studies, website concepts, full-stack demos and interactive JavaScript tools.',
    priority: 0.9, changefreq: 'weekly', crumb: 'Work',
  },
  'contact.html': {
    title: 'Contact Liorgio Ilanan — Hire a Web Designer & Developer',
    description: 'Get in touch with Liorgio Ilanan, web designer and developer in Caloocan, Philippines, for websites, UI/UX design and front-end development.',
    priority: 0.8, changefreq: 'yearly', crumb: 'Contact', schema: 'ContactPage',
  },
  'case-study.html': {
    title: 'Case Study: Building a Full-Stack Portfolio | Liorgio Ilanan',
    description: 'How Liorgio Ilanan built a zero-dependency full-stack portfolio: one API client, a Node.js back end, shared business rules and automated tests.',
    priority: 0.7, changefreq: 'yearly', crumb: 'Case study', schema: 'Article', headline: 'Building a full-stack portfolio',
  },
  'research.html': {
    title: 'What Makes a Website Feel Professional? | Liorgio Ilanan',
    description: 'Web design research notes: visual hierarchy, contrast, consistency, purposeful motion and responsive layouts, applied to a real portfolio.',
    priority: 0.6, changefreq: 'yearly', crumb: 'Research', schema: 'Article', headline: 'What makes a website feel professional?',
  },
  'friesta.html': { title: 'Friesta: Online Food Ordering Web App Demo | Liorgio Ilanan', description: 'Live demo of Friesta, a food-ordering web app with a menu API, cart, promo codes and server-side checkout, built with JavaScript and Node.js.', priority: 0.7, crumb: 'Friesta', app: true },
  'storefront.html': { title: 'Streetwear E-commerce Store Demo | Liorgio Ilanan', description: 'Live e-commerce demo with product search, filters, stock tracking, promo codes and a checkout priced by a Node.js API.', priority: 0.7, crumb: 'Streetwear Store', app: true },
  'analytics-dashboard.html': { title: 'Business Analytics Dashboard Demo | Liorgio Ilanan', description: 'Live analytics dashboard with KPIs, revenue charts, best sellers and a 3D hourly chart, computed from real demo orders.', priority: 0.7, crumb: 'Analytics dashboard', app: true },
  'calculator.html': { title: 'Smart Calculator with a Custom Parser | Liorgio Ilanan', description: 'A JavaScript calculator powered by a hand-written recursive-descent parser: operator precedence, functions and history, with no eval().', priority: 0.5, crumb: 'Smart Calculator', app: true },
  'todo.html': { title: 'Task Dashboard: Drag-and-Drop To-Do App | Liorgio Ilanan', description: 'A task manager web app with priorities, due dates, filters, drag-and-drop ordering and undo, built in vanilla JavaScript.', priority: 0.5, crumb: 'Task Dashboard', app: true },
  'quiz.html': { title: 'Web Development Quiz with Leaderboard | Liorgio Ilanan', description: 'Test your HTML, CSS and JavaScript knowledge: timed questions, explanations, streak scoring and an online leaderboard.', priority: 0.5, crumb: 'Web Dev Quiz', app: true },
  'color-lab.html': { title: 'Color Palette Generator & WCAG Contrast Checker | Liorgio Ilanan', description: 'Generate harmonious color palettes, lock colors, check WCAG contrast ratios and export CSS variables, JSON or Tailwind config.', priority: 0.5, crumb: 'Color Lab', app: true },
  'reaction-game.html': { title: 'Reaction Time Test Game | Liorgio Ilanan', description: 'Test your reaction time over five rounds, track your personal best and compete on an online leaderboard.', priority: 0.4, crumb: 'Reaction Game', app: true },
  'project.html': { title: 'Project | Liorgio Ilanan', description: 'Project details from the portfolio of Liorgio Ilanan.', index: false },
  'about.html': { title: 'About Liorgio Ilanan', description: 'About Liorgio Ilanan, web designer and developer.', index: false },
  '404.html': { title: 'Page not found | Liorgio Ilanan', description: 'This page does not exist.', index: false },
};
