/**
 * seed-utils.js — keeps the demo data "fresh".
 *
 * The seed file contains ~60 days of fake orders created at `generatedAt`.
 * If we served them as-is, the dashboard would look emptier every day.
 * So at load time we slide every order forward by a WHOLE number of days
 * (whole days keep the time-of-day, so "busiest hour" charts stay realistic).
 */
const DAY = 86_400_000;

export function rebaseOrders(orders, generatedAt, now = Date.now()) {
  const shiftDays = Math.floor((now - Date.parse(generatedAt)) / DAY);
  if (shiftDays <= 0) return orders.map((o) => ({ ...o }));
  return orders.map((o) => ({ ...o, createdAt: new Date(Date.parse(o.createdAt) + shiftDays * DAY).toISOString() }));
}
