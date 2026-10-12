/**
 * db.js — a tiny JSON-file database.
 *
 * LESSON: real projects use PostgreSQL / MongoDB / SQLite. A JSON file is perfect for
 * learning because you can open it and SEE your data, and it needs zero installs.
 * The important ideas are the same as with a real database:
 *
 *   1. Writes are SERIALIZED (one at a time) so two requests can't clobber each other.
 *   2. Writes are ATOMIC: we write to a temp file and rename it, so a crash in the
 *      middle of a write can never leave a half-written, corrupted db.json.
 */
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { rebaseOrders } from '../public/js/shared/seed-utils.js';

export class Store {
  /**
   * @param {{ file?: string|null, seedFile: string }} opts  `file: null` = memory only (used by tests)
   */
  constructor({ file, seedFile }) {
    this.file = file;
    this.seedFile = seedFile;
    this.data = null;
    this.queue = Promise.resolve(); // the "line" every write waits in
  }

  async init() {
    if (this.file) {
      try {
        this.data = JSON.parse(await readFile(this.file, 'utf8'));
        return this;
      } catch (err) {
        if (err.code !== 'ENOENT') throw err; // missing file is fine, anything else is a real problem
      }
    }
    const seed = JSON.parse(await readFile(this.seedFile, 'utf8'));
    seed.orders = rebaseOrders(seed.orders, seed.generatedAt);
    this.data = { ...seed, messages: [], scores: {} };
    delete this.data.generatedAt;
    await this.#persist();
    return this;
  }

  /**
   * Run `mutator(data)` safely. Resolves with whatever the mutator returns.
   * Only one update runs at a time, and the file is saved after each one.
   */
  update(mutator) {
    const run = this.queue.then(async () => {
      const result = await mutator(this.data);
      await this.#persist();
      return result;
    });
    // Keep the queue alive even if this update throws, otherwise one error would block every later write.
    this.queue = run.catch(() => {});
    return run;
  }

  async #persist() {
    if (!this.file) return;
    await mkdir(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    await writeFile(tmp, JSON.stringify(this.data, null, 2));
    await rename(tmp, this.file); // atomic swap
  }
}
