/* ============================================================
   js/transactions.js
   Transaction CRUD and the Transactions page rendering.
   - addTransaction()        Add new income or expense
   - deleteTransaction(id)   Remove a transaction by ID
   - renderTransactions()    Render filtered list on the page
   - clearFilters()          Reset all filter inputs
   - setType(type)           Toggle income/expense in the add form
   ============================================================ */

/**
 * Set the active type (income or expense) on the Add Transaction form.
 * Updates toggle button styles and repopulates the category dropdown.
 * @param {'income'|'expense'} type
 */
function setType(type) {
  const incBtn = document.getElementById('add-type-income');
  const expBtn = document.getElementById('add-type-expense');

  incBtn.classList.toggle('active', type === 'income');
  expBtn.classList.toggle('active', type === 'expense');

  // Populate category select with the correct set of categories
  const catSel = document.getElementById('add-cat');
  catSel.innerHTML = CATEGORIES[type]
    .map(c => `<option value="${c}">${c}</option>`)
    .join('');
}

/**
 * Read which type is currently active on the Add form.
 * @returns {'income'|'expense'}
 */
function getCurrentType() {
  return document.getElementById('add-type-income').classList.contains('active')
    ? 'income'
    : 'expense';
}

/**
 * Validate and save a new transaction from the Add Transaction form.
 * Shows a toast on success or error.
 */
function addTransaction() {
  const type   = getCurrentType();
  const desc   = document.getElementById('add-desc').value.trim();
  const amount = parseFloat(document.getElementById('add-amount').value);
  const date   = document.getElementById('add-date').value;
  const cat    = document.getElementById('add-cat').value;
  const note   = document.getElementById('add-note').value.trim();

  // Validation
  if (!desc)              return toast('Please add a description', 'error');
  if (!amount || amount <= 0) return toast('Please enter a valid amount', 'error');
  if (!date)              return toast('Please select a date', 'error');

  // Build transaction object
  const tx = { id: uid(), type, desc, amount, date, cat, note };

  // Prepend to the list so newest appears first
  const txs = getTx();
  txs.unshift(tx);
  setTx(txs);

  toast(`${type === 'income' ? '▲ Income' : '▼ Expense'} of ₹${amount.toLocaleString()} added!`, 'success');

  // Reset form fields (keep date and type)
  document.getElementById('add-desc').value   = '';
  document.getElementById('add-amount').value = '';
  document.getElementById('add-note').value   = '';
}

/**
 * Delete a transaction by ID.
 * Filters it out and re-renders the transaction list.
 * @param {string} id
 */
function deleteTransaction(id) {
  const txs = getTx().filter(t => t.id !== id);
  setTx(txs);
  renderTransactions();
  toast('Transaction deleted', '');
}

/**
 * Render the transactions table with active filters applied.
 * Reads filter values directly from the DOM.
 */
function renderTransactions() {
  let txs = getTx();

  // Read filter values
  const type   = document.getElementById('filter-type').value;
  const cat    = document.getElementById('filter-cat').value;
  const from   = document.getElementById('filter-from').value;
  const to     = document.getElementById('filter-to').value;
  const search = document.getElementById('filter-search').value.toLowerCase();

  // Apply each filter (chain of .filter() calls)
  if (type !== 'all')   txs = txs.filter(t => t.type === type);
  if (cat  !== 'all')   txs = txs.filter(t => t.cat  === cat);
  if (from)             txs = txs.filter(t => t.date  >= from);
  if (to)               txs = txs.filter(t => t.date  <= to);
  if (search)           txs = txs.filter(t =>
    t.desc.toLowerCase().includes(search) || t.cat.toLowerCase().includes(search)
  );

  const body  = document.getElementById('tx-list-body');
  const label = document.getElementById('tx-count-label');

  // Empty state
  if (!txs.length) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        No transactions found
      </div>`;
    label.textContent = '';
    return;
  }

  // Render rows
  body.innerHTML = txs.map(t => `
    <div class="tx-row">
      <div style="display:flex;align-items:center;gap:10px">
        <span>${CAT_ICONS[t.cat] || '💰'}</span>
        <div>
          <div style="font-size:13px">${t.desc}</div>
          ${t.note ? `<div style="font-size:11px;color:var(--muted)">${t.note}</div>` : ''}
        </div>
      </div>
      <div><span class="badge badge-${t.type}">${t.cat}</span></div>
      <div style="color:var(--muted)">${formatDate(t.date)}</div>
      <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString()}</div>
      <div>
        <button class="btn btn-danger btn-sm" onclick="deleteTransaction('${t.id}')">✕</button>
      </div>
    </div>`).join('');

  // Summary line below table
  const net = txs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  label.textContent = `${txs.length} transaction${txs.length > 1 ? 's' : ''} · Net: ${net >= 0 ? '+' : '-'}₹${Math.abs(net).toLocaleString()}`;
}

/**
 * Reset all filter inputs to their default values and re-render.
 */
function clearFilters() {
  document.getElementById('filter-type').value   = 'all';
  document.getElementById('filter-cat').value    = 'all';
  document.getElementById('filter-from').value   = '';
  document.getElementById('filter-to').value     = '';
  document.getElementById('filter-search').value = '';
  renderTransactions();
}