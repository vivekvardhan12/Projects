/* ============================================================
   js/db.js
   Data layer — all reads/writes go through this file.
   Uses localStorage as the "database". To swap to a real
   backend, replace DB.get/set with fetch() API calls here.
   ============================================================ */

// Low-level key/value store wrapping localStorage
const DB = {
  /**
   * Read a value from localStorage.
   * @param {string} key
   * @param {*} defaultValue - returned if key doesn't exist
   */
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Write a value to localStorage.
   * @param {string} key
   * @param {*} value - will be JSON-serialised
   */
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

// ─── User-scoped helpers (depend on currentUser set in auth.js) ───

/** Get all transactions for the logged-in user */
function getTx() {
  return DB.get('sw_tx_' + currentUser.username, []);
}

/** Save updated transactions list for the logged-in user */
function setTx(txs) {
  DB.set('sw_tx_' + currentUser.username, txs);
}

/** Get all budgets for the logged-in user */
function getBudgets() {
  return DB.get('sw_budget_' + currentUser.username, {});
}

/** Save budgets for the logged-in user */
function setBudgets(b) {
  DB.set('sw_budget_' + currentUser.username, b);
}

// ─── Seed demo account on first load ───
(function seedDemoUser() {
  const users = DB.get('sw_users', {});

  // Create demo user if missing
  if (!users['demo']) {
    users['demo'] = { name: 'Demo User', password: 'demo123' };
    DB.set('sw_users', users);
  }

  // Seed demo transactions (only once)
  if (!DB.get('sw_tx_demo', null)) {
    const now = new Date();
    const txs = [];

    // Generate 6 months of sample data
    [0, 1, 2, 3, 4, 5].forEach(monthsAgo => {
      const base = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const y = base.getFullYear();
      const m = base.getMonth();

      txs.push({ id: uid(), type: 'income',  desc: 'Salary',           amount: 75000,                              cat: 'Salary',        date: fmtDate(new Date(y, m, 1)),  note: '' });
      txs.push({ id: uid(), type: 'expense', desc: 'Rent',             amount: 18000,                              cat: 'Housing',       date: fmtDate(new Date(y, m, 2)),  note: '' });
      txs.push({ id: uid(), type: 'expense', desc: 'Groceries',        amount: (4500 + Math.random() * 2000) | 0, cat: 'Food',          date: fmtDate(new Date(y, m, 10)), note: '' });
      txs.push({ id: uid(), type: 'expense', desc: 'Netflix',          amount: 649,                                cat: 'Entertainment', date: fmtDate(new Date(y, m, 15)), note: '' });
      txs.push({ id: uid(), type: 'expense', desc: 'Petrol',           amount: (2200 + Math.random() * 800)  | 0, cat: 'Transport',     date: fmtDate(new Date(y, m, 18)), note: '' });

      // Freelance income every other month
      if (monthsAgo % 2 === 0) {
        txs.push({ id: uid(), type: 'income', desc: 'Freelance Project', amount: (15000 + Math.random() * 10000) | 0, cat: 'Freelance', date: fmtDate(new Date(y, m, 22)), note: '' });
      }
    });

    DB.set('sw_tx_demo', txs);
    DB.set('sw_budget_demo', { Food: 6000, Transport: 3000, Housing: 20000, Entertainment: 2000 });
  }
})();