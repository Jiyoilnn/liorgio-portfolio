/**
 * generate-seed.js — builds public/data/seed.json (products, menu, promos and fake orders).
 *
 * Run it with:  npm run seed
 *
 * LESSON: instead of hand-typing 400 fake orders we GENERATE them. A seeded random
 * number generator (mulberry32) gives the same "random" numbers every run, so the
 * output is reproducible — important for tests and for clean git diffs.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { calcTotals, findPromo } from '../public/js/shared/pricing.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- deterministic random numbers -----------------------------------------
function mulberry32(seed) {
  return function next() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261012);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (a, b) => a + Math.floor(rand() * (b - a + 1));

// ---- catalog ---------------------------------------------------------------
const products = [
  { id: 'tee-heavy',   name: 'Essential Heavy Tee', category: 'Tops',        price: 690,  color: '#1b1d22', colorName: 'Black',  kind: 'tee',    stock: 40, blurb: '240gsm cotton, clean everyday fit.' },
  { id: 'tee-boxy',    name: 'Boxy Pocket Tee',     category: 'Tops',        price: 590,  color: '#e8e4da', colorName: 'Bone',   kind: 'tee',    stock: 32, blurb: 'Cropped boxy cut with a chest pocket.' },
  { id: 'hoodie-relax',name: 'Relaxed Hoodie',      category: 'Tops',        price: 1490, color: '#7b808a', colorName: 'Gray',   kind: 'hoodie', stock: 25, blurb: 'Brushed fleece, drop shoulders.' },
  { id: 'hoodie-zip',  name: 'Zip Hoodie',          category: 'Tops',        price: 1690, color: '#23262c', colorName: 'Black',  kind: 'hoodie', stock: 18, blurb: 'Full zip, heavyweight 380gsm.' },
  { id: 'crew-sand',   name: 'Crewneck Sweat',      category: 'Tops',        price: 1290, color: '#c9b79a', colorName: 'Sand',   kind: 'hoodie', stock: 22, blurb: 'Soft loopback terry, ribbed hem.' },
  { id: 'pants-cargo', name: 'Utility Cargo Pants', category: 'Bottoms',     price: 1890, color: '#8a7f5a', colorName: 'Khaki',  kind: 'pants',  stock: 15, blurb: 'Six pockets, tapered leg.' },
  { id: 'pants-sweat', name: 'Relaxed Sweatpants',  category: 'Bottoms',     price: 1190, color: '#5c6068', colorName: 'Slate',  kind: 'pants',  stock: 28, blurb: 'Wide leg with an adjustable drawcord.' },
  { id: 'cap-utility', name: 'Utility Cap',         category: 'Accessories', price: 450,  color: '#a39466', colorName: 'Khaki',  kind: 'cap',    stock: 50, blurb: 'Six-panel, adjustable strap.' },
  { id: 'beanie-rib',  name: 'Ribbed Beanie',       category: 'Accessories', price: 390,  color: '#1b1d22', colorName: 'Black',  kind: 'beanie', stock: 45, blurb: 'Stretchy rib knit, one size.' },
  { id: 'tote-canvas', name: 'Canvas Tote',         category: 'Accessories', price: 350,  color: '#d9d2c0', colorName: 'Natural',kind: 'bag',    stock: 60, blurb: '12oz canvas with a reinforced base.' },
].map((p) => ({ ...p, shop: 'storefront' }));

const menu = [
  { id: 'fries-classic', name: 'Classic Salted',   category: 'Fries',   price: 59,  desc: 'House-cut, crispy outside, fluffy inside.', tags: ['bestseller'] },
  { id: 'fries-cheese',  name: 'Cheese Blast',     category: 'Fries',   price: 69,  desc: 'Dusted with creamy cheese powder.',         tags: ['bestseller'] },
  { id: 'fries-sour',    name: 'Sour Cream',       category: 'Fries',   price: 69,  desc: 'Tangy sour cream and onion.',                tags: [] },
  { id: 'fries-bbq',     name: 'Smoky BBQ',        category: 'Fries',   price: 69,  desc: 'Sweet and smoky barbecue seasoning.',        tags: [] },
  { id: 'fries-cajun',   name: 'Spicy Cajun',      category: 'Fries',   price: 69,  desc: 'A kick of chili and paprika.',               tags: ['spicy'] },
  { id: 'fries-bucket',  name: 'Barkada Bucket',   category: 'Fries',   price: 199, desc: 'Share-size bucket, pick one flavor.',        tags: ['sharing'] },
  { id: 'combo-solo',    name: 'Solo Combo',       category: 'Combos',  price: 99,  desc: 'Any fries + any drink.',                     tags: ['value'] },
  { id: 'combo-duo',     name: 'Duo Combo',        category: 'Combos',  price: 179, desc: 'Two fries + two drinks.',                    tags: ['value'] },
  { id: 'drink-tea',     name: 'Iced Tea',         category: 'Drinks',  price: 35,  desc: 'Freshly brewed, lightly sweet.',             tags: [] },
  { id: 'drink-cola',    name: 'Cola',             category: 'Drinks',  price: 35,  desc: 'Ice cold.',                                  tags: [] },
  { id: 'drink-lemon',   name: 'Lemonade',         category: 'Drinks',  price: 45,  desc: 'Real lemon, no powder.',                     tags: [] },
  { id: 'add-cheese',    name: 'Cheese Dip',       category: 'Add-ons', price: 15,  desc: 'Warm and gooey.',                            tags: [] },
  { id: 'add-mayo',      name: 'Garlic Mayo',      category: 'Add-ons', price: 15,  desc: 'Creamy and garlicky.',                       tags: [] },
  { id: 'add-chili',     name: 'Chili Sauce',      category: 'Add-ons', price: 10,  desc: 'Sweet-hot Filipino-style.',                  tags: ['spicy'] },
].map((m) => ({ ...m, shop: 'friesta' }));

const promos = {
  WELCOME10: { type: 'percent', value: 10, shops: ['storefront'], label: '10% off your order' },
  FRIESTA20: { type: 'flat', value: 20, minSubtotal: 150, shops: ['friesta'], label: '₱20 off orders from ₱150' },
};

const shops = {
  storefront: { name: 'Streetwear Storefront', fees: { delivery: 99, freeOver: 2000 } },
  friesta: { name: 'Friesta', fees: { delivery: 40, freeOver: 300 } },
};

// ---- fake orders (last 60 days) -------------------------------------------
const firstNames = ['Mark', 'Angel', 'Jasmine', 'Carlo', 'Bea', 'Miguel', 'Trisha', 'Joshua', 'Kyla', 'Renz', 'Aira', 'Paolo', 'Nicole', 'Jerome', 'Sofia', 'Lance'];
const lastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Ramos', 'Aquino', 'Dela Cruz', 'Navarro'];

const NOW = Date.UTC(2026, 9, 12, 2, 0, 0); // fixed so the seed is reproducible
const DAY = 86_400_000;
const lookup = (shop, id) => (shop === 'friesta' ? menu : products).find((x) => x.id === id);

const orders = [];
for (let d = 59; d >= 0; d--) {
  const dayStart = NOW - d * DAY;
  const weekday = new Date(dayStart + 8 * 3600_000).getUTCDay();
  const weekend = weekday === 0 || weekday === 5 || weekday === 6;
  const growth = 1 + (59 - d) / 120; // business slowly grows over the 60 days
  const count = Math.round((between(3, 6) + (weekend ? 3 : 0)) * growth);

  for (let n = 0; n < count; n++) {
    const shop = rand() < 0.62 ? 'friesta' : 'storefront';
    const hourManila = shop === 'friesta' ? between(11, 21) : between(18, 23);
    const ts = dayStart - (new Date(dayStart + 8 * 3600_000).getUTCHours() - hourManila) * 3600_000 + between(0, 59) * 60_000;
    if (ts > NOW) continue;

    const catalog = shop === 'friesta' ? menu : products;
    const lineCount = shop === 'friesta' ? between(1, 3) : between(1, 2);
    const chosen = new Map();
    for (let i = 0; i < lineCount; i++) {
      const item = pick(catalog);
      chosen.set(item.id, (chosen.get(item.id) ?? 0) + between(1, shop === 'friesta' ? 3 : 2));
    }
    const lines = [...chosen].map(([id, qty]) => ({ id, name: lookup(shop, id).name, price: lookup(shop, id).price, qty }));
    const fulfillment = shop === 'storefront' || rand() < 0.35 ? 'delivery' : 'pickup';
    const promoCode = rand() < 0.15 ? (shop === 'friesta' ? 'FRIESTA20' : 'WELCOME10') : '';
    const totals = calcTotals(lines, {
      fees: shops[shop].fees, fulfillment, promo: findPromo(promos, promoCode, shop),
    });

    const age = NOW - ts;
    const status = age > 2 * DAY ? (rand() < 0.06 ? 'cancelled' : 'completed')
      : age > 4 * 3600_000 ? (rand() < 0.5 ? 'completed' : 'processing')
      : pick(['pending', 'processing']);

    orders.push({
      id: '', shop, status, createdAt: new Date(ts).toISOString(), fulfillment,
      customer: { name: `${pick(firstNames)} ${pick(lastNames)}`, contact: '' },
      items: lines, promo: promoCode, totals,
    });
  }
}
orders.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
orders.forEach((o, i) => { o.id = `${o.shop === 'friesta' ? 'FR' : 'SF'}-${1001 + i}`; });

const seed = { generatedAt: new Date(NOW).toISOString(), shops, promos, products, menu, orders };
writeFileSync(join(root, 'public/data/seed.json'), JSON.stringify(seed));
console.log(`seed.json written: ${products.length} products, ${menu.length} menu items, ${orders.length} orders`);
