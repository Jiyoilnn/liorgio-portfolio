/**
 * catalog.js — read-only endpoints for the Friesta menu and the Streetwear products.
 *
 *   GET /api/menu
 *   GET /api/products?category=Tops&q=hood&sort=price-asc
 *   GET /api/products/:id
 */
import { HttpError } from '../http-utils.js';
import { filterProducts, promoHints, uniqueCategories } from '../../public/js/shared/catalog-service.js';

export function registerCatalog(router, { store }) {
  router.get('/api/menu', () => {
    const { menu, shops, promos } = store.data;
    return { body: { shop: shops.friesta, categories: uniqueCategories(menu), items: menu, promoHints: promoHints(promos, 'friesta') } };
  });

  router.get('/api/products', ({ query }) => {
    const { products, shops, promos } = store.data;
    const items = filterProducts(products, {
      category: query.get('category'), q: query.get('q'), sort: query.get('sort'),
    });
    return { body: { shop: shops.storefront, categories: uniqueCategories(products), items, promoHints: promoHints(promos, 'storefront') } };
  });

  router.get('/api/products/:id', ({ params }) => {
    const product = store.data.products.find((p) => p.id === params.id);
    if (!product) throw new HttpError(404, 'Product not found.');
    return { body: product };
  });
}
