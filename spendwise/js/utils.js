/* ============================================================
   js/utils.js
   Shared utility / helper functions used across all modules.
   ============================================================ */

/**
 * Generate a short random unique ID (e.g. "a3f9bc12")
 * Used as the `id` field for each transaction.
 */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Format a Date object into "YYYY-MM-DD" string.
 * Used when saving dates to storage.
 * @param {Date} d
 * @returns {string}
 */
function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

/**
 * Format a "YYYY-MM-DD" string into a human-readable date.
 * Example: "2024-03-15" → "15 Mar 2024"
 * @param {string} str - ISO date string
 * @returns {string}
 */
function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Toast notification ───

let _toastTimer = null;

/**
 * Show a toast message at the bottom-right of the screen.
 * @param {string} msg   - message text
 * @param {string} type  - '' | 'success' | 'error'
 */
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}