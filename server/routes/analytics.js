/**
 *   GET /api/analytics?days=30&shop=all|friesta|storefront
 *
 * Aggregation is done by the shared pure function `summarize`, so the dashboard
 * numbers are identical in live mode and in the browser-only demo mode.
 */
import { summarize } from '../../public/js/shared/analytics.js';

export function registerAnalytics(router, { store }) {
  router.get('/api/analytics', ({ query }) => {
    // Clamp user input to a safe range — never trust query strings.
    const days = Math.min(90, Math.max(1, parseInt(query.get('days') ?? '30', 10) || 30));
    const shop = ['friesta', 'storefront'].includes(query.get('shop')) ? query.get('shop') : 'all';
    return { body: summarize(store.data.orders, { days, shop }) };
  });
}
