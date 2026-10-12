/**
 * catalog-service.js — searching, filtering and sorting products (shared by server + demo mode).
 */
const SORTERS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

/** @param {{category?: string|null, q?: string|null, sort?: string|null}} filters */
export function filterProducts(products, { category, q, sort } = {}) {
  let items = products;
  if (category && category !== 'All') items = items.filter((p) => p.category === category);
  const needle = (q ?? '').trim().toLowerCase();
  if (needle) items = items.filter((p) => `${p.name} ${p.colorName} ${p.category}`.toLowerCase().includes(needle));
  if (SORTERS[sort]) items = [...items].sort(SORTERS[sort]);
  return items;
}

/** Tell the UI which promo codes exist for a shop (labels only, not every rule). */
export function promoHints(promos, shop) {
  return Object.entries(promos).filter(([, p]) => p.shops.includes(shop)).map(([code, p]) => ({ code, label: p.label }));
}

export const uniqueCategories = (items) => [...new Set(items.map((i) => i.category))];
