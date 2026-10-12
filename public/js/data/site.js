/**
 * data/site.js — YOUR details, in one place. Every page reads from here.
 *
 * - Change your email once here and the nav button, contact section, footer and
 *   copy-email buttons all update.
 * - Socials with an empty `url` are hidden automatically. Fill them in when ready.
 * - Anything in this file is public once the site is online. (Your phone number was
 *   removed on purpose. Email is the only contact method.)
 */
export const site = {
  name: 'Liorgio Ilanan',
  firstName: 'Liorgio',
  role: 'UI/UX Designer & Full-Stack Developer',
  location: 'Caloocan City, Metro Manila, Philippines',
  email: 'ilananliorgio@gmail.com',
  socials: [
    { label: 'GitHub', url: '' },     // e.g. 'https://github.com/your-username'
    { label: 'LinkedIn', url: '' },   // e.g. 'https://www.linkedin.com/in/your-name'
    { label: 'Dribbble', url: '' },
  ],
  portrait: {
    webp: 'assets/img/portrait.webp',
    png: 'assets/img/portrait.png',
    bust: 'assets/img/portrait-bust.webp',
    alt: 'Liorgio Ilanan in a black crewneck, resting his hand on his chin and looking to the side',
  },
  // Set to false before sharing the site if you haven't replaced the placeholder entries
  // in data/experience.js yet. Placeholders are clearly labelled either way.
  showPlaceholders: true,
  year: new Date().getFullYear(),
};

/**
 * Main navigation. `href`s starting with "#" are sections on the home page; on every
 * other page layout.js turns them into "index.html#section" automatically.
 */
export const nav = [
  { href: 'projects.html', label: 'Work' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#process', label: 'Process' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];
