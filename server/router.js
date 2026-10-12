/**
 * router.js — a minimal Express-style router (about 40 lines!).
 *
 * LESSON: frameworks like Express are not magic. A router is just a list of
 * (method, pattern, handler) and a function that finds the first match.
 * Patterns like "/api/orders/:id" are turned into regular expressions.
 */
export class Router {
  #routes = [];

  add(method, pattern, handler) {
    const keys = [];
    const regex = new RegExp(
      '^' + pattern.replace(/:([A-Za-z]+)/g, (_, key) => { keys.push(key); return '([^/]+)'; }) + '/?$',
    );
    this.#routes.push({ method, regex, keys, handler });
    return this;
  }

  get(p, h) { return this.add('GET', p, h); }
  post(p, h) { return this.add('POST', p, h); }
  patch(p, h) { return this.add('PATCH', p, h); }

  /** @returns {{handler, params}|{methodNotAllowed:true}|null} */
  match(method, pathname) {
    let pathMatched = false;
    for (const route of this.#routes) {
      const m = route.regex.exec(pathname);
      if (!m) continue;
      pathMatched = true;
      if (route.method !== method) continue;
      const params = {};
      route.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { handler: route.handler, params };
    }
    return pathMatched ? { methodNotAllowed: true } : null;
  }
}
