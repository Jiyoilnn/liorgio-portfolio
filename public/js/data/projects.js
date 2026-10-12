/**
 * data/projects.js — every project on the site lives in this ONE array.
 *
 * Add a project = add an object. The gallery, filters, home page sections and the
 * detail page (project.html?id=...) are all generated from it.
 *
 * HONESTY RULES (please keep them):
 *  - status 'concept'     -> "Concept Project": designed, not built or shipped.
 *  - status 'exploration' -> "UI/UX Exploration": a design study.
 *  - status 'live'        -> "Live Demo": actually built and working in this repo (`demo` link).
 *  None of these are client projects, and no results/testimonials are claimed.
 *
 * Fields
 *  id          url-safe slug (used in project.html?id=...)
 *  category    'uiux' | 'web' | 'fullstack' | 'lab'
 *  platform    'mobile' | 'web' | 'desktop'      ('mobile' also shows under the "Mobile Apps" filter)
 *  size        bento card size on the gallery: 'xl' | 'wide' | 'tall' | ''
 *  preview     how the generated mockup looks (see components/mockup.js)
 *              { kind, brand, headline, theme: { bg, fg, accent, surface }, hue }
 */

// A few reusable colour themes for the mockups.
const T = {
  night:  { bg: '#0f1117', fg: '#f3f4f6', accent: '#7c9cff', surface: '#181b24' },
  paper:  { bg: '#f6f4ef', fg: '#17171a', accent: '#c2410c', surface: '#ffffff' },
  mint:   { bg: '#f2f7f5', fg: '#10231c', accent: '#10b981', surface: '#ffffff' },
  plum:   { bg: '#16101f', fg: '#f5efff', accent: '#c084fc', surface: '#211830' },
  sand:   { bg: '#efe8dc', fg: '#2a2118', accent: '#8a6a3b', surface: '#f8f4ec' },
  ocean:  { bg: '#eef5fb', fg: '#0b2236', accent: '#0ea5e9', surface: '#ffffff' },
  ember:  { bg: '#140d0b', fg: '#fff3ec', accent: '#ff6b3d', surface: '#22140f' },
  mono:   { bg: '#0b0b0c', fg: '#f4f4f4', accent: '#ffd400', surface: '#161617' },
  rose:   { bg: '#fbf1f2', fg: '#2b1116', accent: '#e11d48', surface: '#ffffff' },
  forest: { bg: '#0d1612', fg: '#eaf7ef', accent: '#4ade80', surface: '#14211b' },
  slate:  { bg: '#f4f5f7', fg: '#111827', accent: '#4f46e5', surface: '#ffffff' },
  gold:   { bg: '#0e0d0b', fg: '#f7f1e3', accent: '#d4af37', surface: '#1a1813' },
};

export const CATEGORIES = [
  { id: 'all', label: 'All Projects' },
  { id: 'uiux', label: 'UI/UX Design' },
  { id: 'web', label: 'Web Design' },
  { id: 'mobile', label: 'Mobile Apps' },
  { id: 'fullstack', label: 'Full-Stack' },
  { id: 'lab', label: 'Interactive Lab' },
];

export const STATUS_LABEL = { concept: 'Concept Project', exploration: 'UI/UX Exploration', live: 'Live Demo' };
export const CATEGORY_LABEL = { uiux: 'UI/UX Design', web: 'Web Design', fullstack: 'Full-Stack Development', lab: 'Interactive Lab' };

export const projects = [
  // ======================================================= A. UI/UX DESIGN
  {
    id: 'pulse-saas-dashboard', title: 'Pulse — SaaS Metrics Dashboard', category: 'uiux', platform: 'desktop', status: 'exploration', size: 'xl',
    summary: 'A calm, data-dense dashboard for subscription businesses: MRR, churn and cohorts at a glance.',
    problem: 'SaaS founders juggle numbers across billing, product and support tools, and most dashboards bury the one metric that changed.',
    approach: 'Started from the questions a founder asks every Monday, then designed a hierarchy where the biggest change surfaces first. Dark UI with a single accent so anomalies stand out.',
    features: ['KPI cards with change versus last period', 'Revenue trend with plan breakdown', 'Churn and cohort tables', 'Keyboard-friendly filters'],
    tech: ['UI design', 'Design tokens', 'Data visualisation'],
    preview: { kind: 'dashboard', brand: 'Pulse', headline: 'Revenue overview', theme: T.night, hue: 228 },
  },
  {
    id: 'kalye-bank-app', title: 'Kalye — Mobile Banking App', category: 'uiux', platform: 'mobile', status: 'concept', size: 'tall',
    summary: 'A friendly mobile bank for first-time savers: balances, transfers and savings goals without jargon.',
    problem: 'Banking apps often feel intimidating to young or first-time users, with dense menus and unclear fees.',
    approach: 'Large balance, three primary actions, and plain-language labels. Goals use progress rings so saving feels visible.',
    features: ['Card and balance overview', 'One-tap send and request', 'Savings goals with progress', 'Readable transaction history'],
    tech: ['Mobile UI design', 'Information architecture', 'Accessibility review'],
    preview: { kind: 'phone-bank', brand: 'Kalye', headline: '₱24,580.00', theme: T.plum, hue: 275 },
  },
  {
    id: 'tindahan-shop-app', title: 'Tindahan — E-commerce Mobile App', category: 'uiux', platform: 'mobile', status: 'concept', size: '',
    summary: 'A mobile shopping experience focused on quick browsing, honest prices and a two-step checkout.',
    problem: 'Long checkout flows and hidden shipping fees cause shoppers to abandon carts on mobile.',
    approach: 'Thumb-zone navigation, sticky add-to-cart, and shipping cost shown on the product page, not at the last step.',
    features: ['Product grid with quick add', 'Filters in a bottom sheet', 'Saved items', 'Two-step checkout'],
    tech: ['Mobile UI design', 'Prototyping', 'User flows'],
    preview: { kind: 'phone-shop', brand: 'Tindahan', headline: 'New in', theme: T.paper, hue: 24 },
  },
  {
    id: 'kain-food-delivery', title: 'Kain — Food Delivery App', category: 'uiux', platform: 'mobile', status: 'concept', size: '',
    summary: 'Order from local eateries with clear delivery times, live tracking and reorder in one tap.',
    problem: 'Hungry users want to decide fast. Cluttered feeds and unclear ETAs slow that down.',
    approach: 'Cards lead with photo, ETA and price range. Reorder lives on the home screen because most orders repeat.',
    features: ['Restaurant feed with ETA badges', 'Dish customisation', 'Live order tracking', 'One-tap reorder'],
    tech: ['Mobile UI design', 'User research plan', 'Micro-interactions'],
    preview: { kind: 'phone-food', brand: 'Kain', headline: 'Hungry, Liorgio?', theme: T.ember, hue: 18 },
  },
  {
    id: 'galaw-fitness-app', title: 'Galaw — Fitness & Wellness App', category: 'uiux', platform: 'mobile', status: 'exploration', size: '',
    summary: 'Daily movement, sleep and hydration tracked with rings and gentle streaks instead of guilt.',
    problem: 'Many fitness apps motivate through pressure, which makes beginners quit after a missed day.',
    approach: 'Soft streaks that survive one rest day, rings that celebrate partial progress, and a dark, low-glare palette for night use.',
    features: ['Activity rings', 'Workout library', 'Sleep and water logs', 'Weekly reflection'],
    tech: ['Mobile UI design', 'Data visualisation', 'Motion design'],
    preview: { kind: 'phone-fitness', brand: 'Galaw', headline: 'Today', theme: T.forest, hue: 140 },
  },
  {
    id: 'lakbay-travel-booking', title: 'Lakbay — Travel Booking Platform', category: 'uiux', platform: 'web', status: 'concept', size: 'wide',
    summary: 'Search flights, stays and island tours in one flow, with total trip cost always visible.',
    problem: 'Travellers compare prices across many tabs because add-ons appear only at the end.',
    approach: 'A single search bar for the whole trip and a live total that updates as options are picked.',
    features: ['Unified trip search', 'Price calendar', 'Live trip total', 'Saved itineraries'],
    tech: ['Web UI design', 'Search UX', 'Responsive layouts'],
    preview: { kind: 'site-hero-search', brand: 'Lakbay', headline: 'Find your next island.', theme: T.ocean, hue: 195 },
  },
  {
    id: 'vital-health-dashboard', title: 'Vital — Healthcare Dashboard', category: 'uiux', platform: 'desktop', status: 'concept', size: '',
    summary: 'A clinic dashboard for nurses: patient queue, vitals trends and alerts in one readable screen.',
    problem: 'Clinical screens are often cluttered, and critical alerts compete with routine information.',
    approach: 'Status colours are reserved for alerts only, always paired with icons and labels. Large type for quick reading during rounds.',
    features: ['Patient queue', 'Vitals trend charts', 'Priority alerts', 'Shift hand-off notes'],
    tech: ['Dashboard design', 'Accessibility', 'Information hierarchy'],
    preview: { kind: 'dashboard-health', brand: 'Vital', headline: 'Ward 3B', theme: T.mint, hue: 160 },
  },
  {
    id: 'aral-learning-platform', title: 'Aral — Learning Management Platform', category: 'uiux', platform: 'desktop', status: 'concept', size: '',
    summary: 'Courses, progress and deadlines for students, with a teacher view for assignments.',
    problem: 'Students lose track of deadlines across subjects, and LMS interfaces feel like admin software.',
    approach: 'A "today" view with what is due, course cards with visible progress, and friendly empty states.',
    features: ['Course cards with progress', 'Deadline timeline', 'Lesson player', 'Teacher grading view'],
    tech: ['Web UI design', 'User flows', 'Design system'],
    preview: { kind: 'dashboard-course', brand: 'Aral', headline: 'Continue learning', theme: T.slate, hue: 245 },
  },
  {
    id: 'tuon-productivity', title: 'Tuon — Focus & Productivity App', category: 'uiux', platform: 'desktop', status: 'exploration', size: '',
    summary: 'A board-style planner that pairs tasks with focus sessions so planning turns into doing.',
    problem: 'To-do lists grow, but nothing helps you actually start the most important task.',
    approach: 'Each card can launch a focus timer. The board limits "In progress" to three cards to fight multitasking.',
    features: ['Kanban board with WIP limit', 'Focus timer per task', 'Daily review', 'Keyboard shortcuts'],
    tech: ['Product design', 'Interaction design', 'Prototyping'],
    preview: { kind: 'kanban', brand: 'Tuon', headline: 'This week', theme: T.mono, hue: 50 },
  },
  {
    id: 'barkada-social-app', title: 'Barkada — Social Media App', category: 'uiux', platform: 'mobile', status: 'concept', size: '',
    summary: 'A small-circle social app for close friends: stories, posts and plans without public follower counts.',
    problem: 'Big social feeds optimise for strangers and engagement, not for staying close to friends.',
    approach: 'No public counts, a chronological feed and a shared "plans" tab that turns chats into meetups.',
    features: ['Stories row', 'Chronological feed', 'Group plans', 'Private reactions'],
    tech: ['Mobile UI design', 'Feed design', 'Privacy-first UX'],
    preview: { kind: 'phone-feed', brand: 'Barkada', headline: 'Friends', theme: T.rose, hue: 345 },
  },

  // ======================================================= B. WEBSITE DESIGN
  {
    id: 'maison-noir-fashion', title: 'Maison Noir — Luxury Fashion Website', category: 'web', platform: 'web', status: 'concept', size: 'tall',
    summary: 'An editorial fashion site with oversized type, slow imagery and a quiet, premium checkout.',
    problem: 'Luxury brands need to feel exclusive online while still being easy to shop.',
    approach: 'Magazine-style layouts for storytelling, then a minimal product page where the garment does the talking.',
    features: ['Editorial lookbook', 'Collection pages', 'Minimal product detail', 'Size guide overlay'],
    tech: ['Web design', 'Typography', 'Art direction'],
    preview: { kind: 'site-editorial', brand: 'MAISON NOIR', headline: 'The Night Collection', theme: T.gold, hue: 40 },
  },
  {
    id: 'sabor-restaurant-site', title: 'Sabor — Restaurant Website', category: 'web', platform: 'web', status: 'concept', size: '',
    summary: 'A warm restaurant site where the menu, hours and reservation button are never more than one tap away.',
    problem: 'Restaurant sites often hide the menu in a PDF and the opening hours in the footer.',
    approach: 'Menu as real, searchable HTML. Hours and "Reserve" pinned in the header on mobile.',
    features: ['HTML menu with dietary tags', 'Reservation CTA', 'Location and hours', 'Gallery'],
    tech: ['Web design', 'Responsive design', 'Content strategy'],
    preview: { kind: 'site-split', brand: 'Sabor', headline: 'Slow food, open fire.', theme: T.sand, hue: 28 },
  },
  {
    id: 'personal-brand-site', title: 'Personal Branding Website', category: 'web', platform: 'web', status: 'concept', size: '',
    summary: 'A one-page personal site template for creators: who you are, what you do, how to reach you.',
    problem: 'Freelancers often send people to scattered social profiles instead of one clear home page.',
    approach: 'One scroll: intro, three proof points, selected work, contact. Easy to edit, fast to load.',
    features: ['Hero with portrait', 'Services', 'Selected work', 'Email CTA'],
    tech: ['Web design', 'Copywriting structure', 'Performance'],
    preview: { kind: 'site-personal', brand: 'Ana Reyes', headline: 'Illustrator & storyteller', theme: T.paper, hue: 12 },
  },
  {
    id: 'kilos-creative-agency', title: 'Kilos — Creative Agency Website', category: 'web', platform: 'web', status: 'exploration', size: 'wide',
    summary: 'Bold, kinetic typography for a design studio that wants to look as confident as its work.',
    problem: 'Agency sites blend together: the same grid, the same stock photos, the same claims.',
    approach: 'Oversized type, a scrolling marquee of services and case studies presented like posters.',
    features: ['Kinetic headline', 'Services marquee', 'Poster-style case studies', 'Contact form'],
    tech: ['Web design', 'Motion concepts', 'Brand expression'],
    preview: { kind: 'site-bold', brand: 'KILOS', headline: 'We make brands move.', theme: T.mono, hue: 50 },
  },
  {
    id: 'tahanan-real-estate', title: 'Tahanan — Real Estate Website', category: 'web', platform: 'web', status: 'concept', size: '',
    summary: 'Property search with honest filters, map view and clear monthly cost estimates.',
    problem: 'Listings often show a price but not what a family would actually pay per month.',
    approach: 'Every card shows an estimated monthly amortisation next to the price. Filters match how people talk ("near school").',
    features: ['Smart filters', 'Listing cards with monthly estimate', 'Map view', 'Viewing requests'],
    tech: ['Web design', 'Search UX', 'Responsive design'],
    preview: { kind: 'site-listings', brand: 'Tahanan', headline: 'Homes near you', theme: T.slate, hue: 210 },
  },
  {
    id: 'alon-hotel-site', title: 'Alon — Hotel & Resort Website', category: 'web', platform: 'web', status: 'concept', size: '',
    summary: 'A beach resort site that sells the feeling first, then makes booking dates painless.',
    problem: 'Hotel booking widgets are often clunky and break the mood of the site.',
    approach: 'Full-bleed imagery with an elegant date picker floating over it, and room pages that compare options side by side.',
    features: ['Immersive hero', 'Floating booking bar', 'Room comparison', 'Experiences'],
    tech: ['Web design', 'Art direction', 'Booking UX'],
    preview: { kind: 'site-hero-search', brand: 'ALON', headline: 'Wake up to the sea.', theme: T.sand, hue: 185 },
  },
  {
    id: 'vector-automotive', title: 'Vector — Automotive Website', category: 'web', platform: 'web', status: 'exploration', size: '',
    summary: 'A dark, cinematic site for an electric car: performance stats, colour configurator and test-drive booking.',
    problem: 'Car sites must balance emotion (the product) with practical specs and booking.',
    approach: 'Cinematic hero, specs as big numbers, and a configurator that updates price live.',
    features: ['Cinematic hero', 'Spec highlights', 'Colour configurator', 'Test-drive booking'],
    tech: ['Web design', 'Product storytelling', '3D-ready layouts'],
    preview: { kind: 'site-showcase', brand: 'VECTOR', headline: 'Zero to 100 in 3.2s', theme: T.night, hue: 210 },
  },
  {
    id: 'launchpad-startup', title: 'Launchpad — Tech Startup Landing Page', category: 'web', platform: 'web', status: 'concept', size: '',
    summary: 'A conversion-focused landing page for a developer tool: clear promise, product shot, social proof slots.',
    problem: 'Startup pages often lead with buzzwords instead of what the product actually does.',
    approach: 'One-sentence promise, a real product screenshot, then features as "before / after" pairs.',
    features: ['Clear hero promise', 'Product screenshot', 'Feature pairs', 'Pricing table'],
    tech: ['Landing page design', 'Conversion UX', 'Responsive design'],
    preview: { kind: 'site-saas', brand: 'Launchpad', headline: 'Ship your API in minutes.', theme: T.plum, hue: 265 },
  },
  {
    id: 'hugis-architecture', title: 'Hugis — Architecture & Interior Studio', category: 'web', platform: 'web', status: 'concept', size: '',
    summary: 'An asymmetric, image-led portfolio site for an architecture studio.',
    problem: 'Architecture work needs space to breathe online; tight grids flatten it.',
    approach: 'Asymmetric grid with generous whitespace, project pages built around large images and short captions.',
    features: ['Asymmetric project grid', 'Project stories', 'Studio page', 'Enquiry form'],
    tech: ['Web design', 'Grid systems', 'Typography'],
    preview: { kind: 'site-grid', brand: 'hugis', headline: 'Spaces that listen.', theme: T.paper, hue: 30 },
  },
  {
    id: 'kahoy-furniture-shop', title: 'Kahoy — Premium Furniture E-commerce', category: 'web', platform: 'web', status: 'concept', size: '',
    summary: 'A furniture store that shows materials, dimensions and room fit before you buy.',
    problem: 'Buying furniture online is risky when you cannot judge size or material.',
    approach: 'Dimensions drawn on the product image, material swatches and a "fits through your door" checker concept.',
    features: ['Product grid', 'Material swatches', 'Dimension overlay', 'Delivery estimate'],
    tech: ['E-commerce design', 'Product page UX', 'Responsive design'],
    preview: { kind: 'site-shop', brand: 'Kahoy', headline: 'Made from narra & rattan', theme: T.sand, hue: 32 },
  },

  // ======================================================= C. FULL-STACK
  {
    id: 'streetwear-store', title: 'Streetwear Store & Stock Tracking', category: 'fullstack', platform: 'web', status: 'live', size: 'xl', demo: 'storefront.html',
    summary: 'A working webstore: search, filters, stock limits, promo codes and a checkout priced by the server.',
    problem: 'A store front end cannot be trusted with prices or stock. Anyone can edit a request.',
    approach: 'The browser stores only item IDs and quantities. The Node API looks up real prices, checks stock and calculates totals. Shared validation runs on both sides.',
    features: ['Debounced search, filters and sorting', 'Stock limits enforced on the server', 'Promo codes and free-shipping rules', 'Checkout with field-level validation'],
    tech: ['JavaScript (ES modules)', 'Node.js http', 'REST API', 'JSON database', 'node:test'],
    preview: { kind: 'admin-products', brand: 'Streetwear', headline: 'Products', theme: T.mono, hue: 50 },
  },
  {
    id: 'stockroom-inventory', title: 'Stockroom — Inventory Management Dashboard', category: 'fullstack', platform: 'desktop', status: 'concept', size: '',
    summary: 'Track stock across branches, get low-stock alerts and log deliveries.',
    problem: 'Small shops track inventory in notebooks or spreadsheets and run out of best sellers without warning.',
    approach: 'Planned as an extension of this repo’s Node API: products, stock movements and low-stock thresholds. UI designed first.',
    features: ['Stock table with low-stock highlights', 'Delivery and adjustment logs', 'Per-branch view', 'CSV export (planned)'],
    tech: ['Planned: Node.js API', 'SQLite', 'Vanilla JS front end'],
    preview: { kind: 'dashboard-table', brand: 'Stockroom', headline: 'Inventory', theme: T.slate, hue: 230 },
  },
  {
    id: 'friesta-ordering', title: 'Friesta — Restaurant Ordering System', category: 'fullstack', platform: 'web', status: 'live', size: 'wide', demo: 'friesta.html',
    summary: 'Live menu, cart, promo codes and pickup or delivery checkout for a fries shop, plus a 3D carton made from scratch.',
    problem: 'A small food business needs online ordering that is simple for customers and reliable on the back end.',
    approach: 'Menu served by the API, cart state in a tiny store, checkout through a native <dialog>. Orders flow into the analytics dashboard.',
    features: ['Menu API with categories', 'Cart drawer with live server quote', 'Pickup / delivery and promo codes', 'Hand-written canvas 3D carton'],
    tech: ['JavaScript', 'Node.js', 'REST API', 'Canvas 3D engine'],
    preview: { kind: 'order-board', brand: 'Friesta', headline: 'Orders', theme: T.ember, hue: 8 },
  },
  {
    id: 'sked-booking', title: 'Sked — Appointment Booking Platform', category: 'fullstack', platform: 'web', status: 'concept', size: '',
    summary: 'Clients pick an open time slot, businesses manage their calendar and get reminders.',
    problem: 'Booking by chat leads to double bookings and endless back-and-forth.',
    approach: 'Designed around one rule: a slot can only be held by one person (enforced on the server). Calendar UI first, API planned.',
    features: ['Available slot picker', 'Business calendar', 'Booking confirmation email (planned)', 'No double bookings'],
    tech: ['Planned: Node.js API', 'Database transactions', 'Email service'],
    preview: { kind: 'calendar', brand: 'Sked', headline: 'October', theme: T.mint, hue: 160 },
  },
  {
    id: 'ugnay-crm', title: 'Ugnay — CRM Dashboard', category: 'fullstack', platform: 'desktop', status: 'concept', size: '',
    summary: 'A lightweight sales pipeline for small teams: leads, deals and follow-ups.',
    problem: 'Small teams lose leads in chat threads because there is no shared pipeline.',
    approach: 'Drag deals between stages, every deal has a next step and a date. Designed as a concept; API planned.',
    features: ['Pipeline board', 'Deal value per stage', 'Follow-up reminders', 'Activity timeline'],
    tech: ['Planned: Node.js API', 'Auth', 'Relational database'],
    preview: { kind: 'crm', brand: 'Ugnay', headline: 'Pipeline', theme: T.night, hue: 200 },
  },
  {
    id: 'task-dashboard', title: 'Task Dashboard — Project Management', category: 'fullstack', platform: 'web', status: 'live', size: '', demo: 'todo.html',
    summary: 'A working task manager with priorities, due dates, drag-and-drop ordering and undo.',
    problem: 'Simple to-do lists lack priority and ordering, while big tools are overkill for personal work.',
    approach: 'State → render architecture in vanilla JS. Data saved in the browser (no server needed yet).',
    features: ['Priorities and due dates', 'Drag-and-drop ordering', 'Undo for deletes', 'Search and filters'],
    tech: ['JavaScript', 'HTML5 drag and drop', 'localStorage'],
    preview: { kind: 'kanban', brand: 'Tasks', headline: 'My tasks', theme: T.night, hue: 50 },
  },
  {
    id: 'sulat-cms', title: 'Sulat — Blog & Content Management System', category: 'fullstack', platform: 'web', status: 'concept', size: '',
    summary: 'Write, schedule and publish posts with drafts, categories and a clean public blog.',
    problem: 'Heavy CMS platforms are overwhelming for a single writer who just wants to publish.',
    approach: 'A distraction-free editor, Markdown under the hood, and a public blog generated from the same data.',
    features: ['Distraction-free editor', 'Drafts and scheduling', 'Categories and tags', 'Public blog pages'],
    tech: ['Planned: Node.js API', 'Markdown', 'Database'],
    preview: { kind: 'editor', brand: 'Sulat', headline: 'Untitled post', theme: T.paper, hue: 20 },
  },
  {
    id: 'susi-auth', title: 'Susi — Authentication & User Accounts', category: 'fullstack', platform: 'web', status: 'concept', size: '',
    summary: 'Sign-up, login, password reset and account settings designed with security first.',
    problem: 'Auth is easy to get dangerously wrong: weak hashing, leaky error messages, missing rate limits.',
    approach: 'Planned with Node’s crypto.scrypt for hashing, HTTP-only cookies for sessions and the rate limiter already in this repo.',
    features: ['Sign-up and login', 'Password reset flow', 'Session management', 'Rate-limited endpoints'],
    tech: ['Planned: Node.js crypto', 'HTTP-only cookies', 'Rate limiting'],
    preview: { kind: 'auth', brand: 'Susi', headline: 'Welcome back', theme: T.plum, hue: 270 },
  },
  {
    id: 'business-analytics', title: 'Business Analytics Dashboard', category: 'fullstack', platform: 'desktop', status: 'live', size: 'wide', demo: 'analytics-dashboard.html',
    summary: 'Real KPIs, revenue trends, best sellers and a 3D hourly chart computed from the orders in the other demos.',
    problem: 'Shop owners need to see how the business is doing without exporting spreadsheets.',
    approach: 'A pure, tested `summarize()` function aggregates orders. Charts are hand-built SVG with tooltips, keyboard support and a table view.',
    features: ['KPIs versus previous period', 'Accessible SVG charts', '3D bar chart (custom engine)', 'Admin-only status changes'],
    tech: ['JavaScript', 'Node.js', 'SVG', 'Canvas 3D'],
    preview: { kind: 'dashboard', brand: 'Analytics', headline: 'Business overview', theme: T.mono, hue: 50 },
  },
  {
    id: 'control-admin', title: 'Control — Admin Management Platform', category: 'fullstack', platform: 'desktop', status: 'concept', size: '',
    summary: 'Manage users, roles and permissions with an audit log of every change.',
    problem: 'Admin panels often give everyone full access and keep no record of who changed what.',
    approach: 'Role-based access designed from the start, with an append-only audit log. Builds on the admin-key idea in the analytics demo.',
    features: ['User table with roles', 'Permission matrix', 'Audit log', 'Bulk actions'],
    tech: ['Planned: Node.js API', 'Role-based access control', 'Audit logging'],
    preview: { kind: 'admin-table', brand: 'Control', headline: 'Users', theme: T.slate, hue: 250 },
  },

  // ======================================================= INTERACTIVE LAB (built + working)
  {
    id: 'smart-calculator', title: 'Smart Calculator', category: 'lab', platform: 'web', status: 'live', size: '', demo: 'calculator.html',
    summary: 'A hand-written recursive-descent parser: precedence, functions and percentages, with no eval().',
    problem: 'Calculators built with eval() can run injected code.',
    approach: 'Tokenizer + grammar functions, each rule calling the next level of precedence. Fully unit-tested.',
    features: ['Operator precedence and parentheses', 'Functions and constants', 'History', 'Safe by design'],
    tech: ['JavaScript', 'Parsing', 'node:test'],
    preview: { kind: 'tool-calc', brand: 'Calc', headline: '2 + 3 × 4', theme: T.mono, hue: 50 },
  },
  {
    id: 'web-dev-quiz', title: 'Web Dev Quiz', category: 'lab', platform: 'web', status: 'live', size: '', demo: 'quiz.html',
    summary: 'Timed questions with explanations, speed and streak scoring, and an online leaderboard.',
    problem: 'Learning sticks better with quick feedback and a little friendly competition.',
    approach: 'Fisher–Yates shuffled questions, a countdown per question and scores posted to the API.',
    features: ['Timed questions', 'Explanations', 'Streak scoring', 'Leaderboard API'],
    tech: ['JavaScript', 'REST API'],
    preview: { kind: 'tool-quiz', brand: 'Quiz', headline: 'What does fetch() return?', theme: T.night, hue: 230 },
  },
  {
    id: 'color-lab', title: 'Color Lab', category: 'lab', platform: 'web', status: 'live', size: '', demo: 'color-lab.html',
    summary: 'Colour-wheel palettes with locking, WCAG contrast checking and CSS / JSON export.',
    problem: 'Pretty palettes are useless if text on them is unreadable.',
    approach: 'HSL harmony maths plus the WCAG relative-luminance formula, all unit-tested.',
    features: ['Harmony modes', 'Lock swatches', 'Contrast checker', 'Export to CSS, JSON, Tailwind'],
    tech: ['JavaScript', 'Colour science', 'Accessibility'],
    preview: { kind: 'tool-palette', brand: 'Color Lab', headline: 'Analogous', theme: T.mono, hue: 280 },
  },
  {
    id: 'reaction-game', title: 'Reaction Game', category: 'lab', platform: 'web', status: 'live', size: '', demo: 'reaction-game.html',
    summary: 'Five rounds, averaged with performance.now() timing, and a global leaderboard.',
    problem: 'Click events add delay, so naive reaction tests are unfair.',
    approach: 'Timing starts on pointerdown, not click. Keyboard playable. Scores validated on the server.',
    features: ['5-round average', 'Personal best', 'Keyboard support', 'Leaderboard API'],
    tech: ['JavaScript', 'Performance API', 'REST API'],
    preview: { kind: 'tool-reaction', brand: 'Reaction', headline: 'CLICK!', theme: T.forest, hue: 140 },
  },
];

/** Helpers used by several pages. */
export const byId = (id) => projects.find((p) => p.id === id);
export const inFilter = (p, filter) =>
  filter === 'all' ? true : filter === 'mobile' ? p.platform === 'mobile' : p.category === filter;
export const statusLabel = (p) => STATUS_LABEL[p.status];
