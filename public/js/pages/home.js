/**
 * pages/home.js — entry point for index.html. Each section lives in its own module.
 */
import { initHero } from '../sections/hero.js';
import { initShowcase } from '../sections/showcase.js';
import { renderHomeSections, initScrollEffects } from '../sections/home-sections.js';

initHero();
renderHomeSections();
initShowcase();
initScrollEffects();
