/**
 * copy-email.js — any element with  data-copy-email  becomes a "copy my email" button.
 * Uses the async Clipboard API, with a fallback for older browsers / non-HTTPS pages.
 */
import { site } from '../data/site.js';
import { toast } from '../lib/dom.js';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: a temporary, off-screen textarea + execCommand('copy').
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function initCopyEmail(root = document) {
  root.querySelectorAll('[data-copy-email]:not([data-copy-ready])').forEach((btn) => {
    btn.dataset.copyReady = '';
    const original = btn.innerHTML;
    btn.addEventListener('click', async () => {
      const ok = await copyText(site.email);
      if (ok) {
        btn.classList.add('copied');
        btn.textContent = 'Copied ✓';
        toast(`${site.email} copied to clipboard`, 'success');
        setTimeout(() => { btn.innerHTML = original; btn.classList.remove('copied'); }, 1800);
      } else {
        toast(`Copy blocked. My email is ${site.email}`, 'error');
      }
    });
  });
}
