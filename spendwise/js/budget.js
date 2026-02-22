/* ============================================================
   js/budget.js
   Budget Manager page:
   - setBudget()      Save a monthly limit for a category
   - removeBudget()   Remove a category's budget
   - renderBudget()   Render all category budget cards with progress
   ============================================================ */

/**
 * Save a budget limit for the selected category.
 * Reads values from the DOM form.
 */
function setBudget() {
  const cat    = document.getElementById('budget-cat-sel').value;
  const amount = parseFloat(document.getElementById('budget-amount').value);

  if (!amount || amount <= 0) {
    toast('Enter a valid budget amount', 'error');
    return;
  }

  const budgets = getBudgets();
  budgets[cat]  = amount;
  setBudgets(budgets);

  // Clear the amount input after saving
  document.getElementById('budget-amount').value = '';

  toast(`Budget set for ${cat}!`, 'success');
  renderBudget();
}

/**
 * Remove the budget limit for a given category.
 * @param {string} cat - category name
 */
function removeBudget(cat) {
  const budgets = getBudgets();
  delete budgets[cat];
  setBudgets(budgets);
  renderBudget();
  toast(`Budget removed for ${cat}`, '');
}

/**
 * Render all expense category budget cards.
 * Each card shows: category name, amount spent this month,
 * limit, a progress bar, and an over-budget warning if needed.
 */
function renderBudget() {
  const budgets = getBudgets();
  const txs     = getTx();
  const now     = new Date();
  const grid    = document.getElementById('budget-grid');

  const cards = CATEGORIES.expense.map(cat => {
    const limit = budgets[cat] || 0;

    // Sum expenses for this category in the current month only
    const spent = txs
      .filter(t => {
        const d = new Date(t.date);
        return t.type     === 'expense'
          && t.cat       === cat
          && d.getMonth()    === now.getMonth()
          && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);

    // Calculate % used (capped at 100 for the bar width)
    const pct  = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const over = limit > 0 && spent > limit;

    // Color: red if over budget, yellow if >75%, green otherwise
    const color = over ? 'var(--red)' : pct > 75 ? 'var(--yellow)' : 'var(--green)';

    return `
      <div class="budget-card">
        <div class="budget-header">
          <div class="budget-cat">${CAT_ICONS[cat] || '•'} ${cat}</div>
          ${limit > 0
            ? `<button class="btn btn-danger btn-sm" onclick="removeBudget('${cat}')">✕</button>`
            : ''}
        </div>

        <div class="budget-amounts">
          <span class="budget-spent" style="color:${color}">
            ₹${spent.toLocaleString()} spent
          </span>
          <span class="budget-limit">
            ${limit > 0 ? 'of ₹' + limit.toLocaleString() : 'No limit set'}
          </span>
        </div>

        ${limit > 0 ? `
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px">
            ${over ? '⚠ Over budget!' : pct.toFixed(0) + '% used'}
          </div>` : ''}
      </div>`;
  });

  grid.innerHTML = cards.join('');
}