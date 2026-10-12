/**
 *   POST /api/contact   { name, email, message }
 *
 * Messages are saved to the db. (To get an email notification you would call a mail
 * service such as Resend/SendGrid right after saving — see docs/HOW-IT-WORKS.md.)
 */
import { randomUUID } from 'node:crypto';
import { HttpError } from '../http-utils.js';
import { validateContact } from '../../public/js/shared/validators.js';

export function registerContact(router, { store }) {
  router.post('/api/contact', async ({ body, req }) => {
    const v = validateContact(await body());
    if (!v.ok) throw new HttpError(422, 'Please fix the highlighted fields.', v.errors);

    // Honeypot: real people never fill the hidden "website" field, bots often do.
    // We pretend it worked so bots don't learn they were caught.
    const raw = await body();
    if (raw.website) return { status: 201, body: { ok: true } };

    await store.update((data) => {
      data.messages.push({ id: randomUUID(), ...v.value, createdAt: new Date().toISOString(), ua: req.headers['user-agent']?.slice(0, 120) });
      data.messages = data.messages.slice(-500); // keep the file from growing forever
    });
    return { status: 201, body: { ok: true } };
  });
}
