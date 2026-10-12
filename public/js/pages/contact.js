/**
 * contact.js — contact form with live validation, API submission and a graceful fallback.
 */
import { api, ApiError, getMode } from '../lib/api.js';
import { h, qs, toast } from '../lib/dom.js';
import { site } from '../data/site.js';
import { validateContact } from '../shared/validators.js';

// ---- details list, built from site.config.js ----------------------------------------
const info = qs('#contact-info');
const items = [
  ['EMAIL', site.email && h('a', { href: `mailto:${site.email}` }, site.email)],
  ['LOCATION', site.location],
  ...site.socials.filter((x) => x.url).map((x) => [x.label.toUpperCase(), h('a', { href: x.url, rel: 'noopener', target: '_blank' }, x.url.replace(/^https?:\/\//, ''))]),
].filter(([, v]) => v);
info.append(...items.map(([k, v]) => h('div', { class: 'info-item reveal' }, h('strong', {}, k), h('p', {}, v))));
info.append(h('button', { class: 'outline', type: 'button', 'data-copy-email': '' }, 'Copy email address'));
window.dispatchEvent(new Event('content-updated'));

// ---- form ------------------------------------------------------------------------------
const form = qs('#contact-form');
const status = qs('#form-status');
const send = qs('#send');
const message = qs('#message');
qs('#count').textContent = '0';
message.addEventListener('input', () => { qs('#count').textContent = message.value.length; });

/** Show or clear the red error text under one field. */
function showError(name, text) {
  const field = form.elements[name].closest('.field');
  field.classList.toggle('invalid', Boolean(text));
  field.querySelector('small.error')?.remove();
  if (text) field.append(h('small', { class: 'error', role: 'alert' }, text));
}

// Re-validate a field when the user leaves it (blur) — friendlier than yelling while they type.
for (const name of ['name', 'email', 'message']) {
  form.elements[name].addEventListener('blur', () => showError(name, validateContact(Object.fromEntries(new FormData(form)))?.errors[name]));
}

// HONESTY: on a static host (GitHub Pages) there is no server to receive messages. Instead of
// pretending to "send", the form opens the visitor's email app with their message pre-filled.
let demo = false;
getMode().then((mode) => {
  demo = mode === 'demo';
  if (!demo) return;
  const note = qs('#form-note');
  note.hidden = false;
  note.textContent = 'This site is hosted without a server, so the form opens your email app with your message ready to send.';
  send.textContent = 'Open in my email app ↗';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const v = validateContact(data); // same function the server uses
  ['name', 'email', 'message'].forEach((n) => showError(n, v.errors[n]));
  if (!v.ok) { form.elements[Object.keys(v.errors)[0]].focus(); return; }

  if (demo) {
    const subject = encodeURIComponent(`Portfolio message from ${v.value.name}`);
    const body = encodeURIComponent(`${v.value.message}\n\n— ${v.value.name} (${v.value.email})`);
    location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    status.textContent = 'Your email app should open now. If nothing happens, copy my address from the right.';
    return;
  }

  send.disabled = true;
  status.textContent = 'Sending…';
  try {
    await api.post('contact', data);
    form.reset();
    qs('#count').textContent = '0';
    status.textContent = '';
    toast('Message sent. Thank you!', 'success');
  } catch (err) {
    if (err instanceof ApiError && err.details) Object.entries(err.details).forEach(([n, t]) => form.elements[n] && showError(n, t));
    status.textContent = '';
    toast(err.message, 'error');
    // Fallback so the visitor is never stuck: offer their mail app.
    if (site.email) status.append('Or email me directly: ', h('a', { href: `mailto:${site.email}?subject=Portfolio%20message` }, site.email));
  } finally {
    send.disabled = false;
  }
});
