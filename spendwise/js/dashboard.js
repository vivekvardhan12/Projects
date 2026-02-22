/* ============================================================
   js/dashboard.js
   Dashboard page rendering:
   - Summary stat cards (income, expense, balance, this month)
   - Recent transactions list
   - Monthly income vs expense bar chart
   ============================================================ */

// Chart instances are stored globally so we can destroy them
// before recreating (prevents "canvas already in use" errors).
let charts = {};

/**
 * Render the entire Dashboard page.
 * Called every time the user navigates to the Dashboard.
 */
function renderDashboard() {
  const txs     = getTx();
  const now     = new Date();

  // ─── Aggregate totals ───
  const totalIncome  = txs.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  // This month's expenses only
  const thisMonthExpense = txs
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense'
        && d.getFullYear() === now.getFullYear()
        && d.getMonth()   === now.getMonth();
    })
    .reduce((s, t) => s + t.amount, 0);

  // ─── Update stat cards ───
  document.getElementById('stat-income').textContent  = '₹' + totalIncome.toLocaleString();
  document.getElementById('stat-expense').textContent = '₹' + totalExpense.toLocaleString();
  document.getElementById('stat-balance').textContent = '₹' + netBalance.toLocaleString();
  document.getElementById('stat-month').textContent   = '₹' + thisMonthExpense.toLocaleString();

  document.getElementById('stat-income-count').textContent  = txs.filter(t => t.type === 'income').length  + ' transactions';
  document.getElementById('stat-expense-count').textContent = txs.filter(t => t.type === 'expense').length + ' transactions';

  const savingsRate = totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0;
  document.getElementById('stat-savings-rate').textContent = `Savings rate: ${savingsRate}%`;
  document.getElementById('stat-month-label').textContent  = now.toLocaleString('default', { month: 'long' }) + ' spending';

  // ─── Greeting ───
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-greeting').textContent = `${greeting}, ${currentUser.name.split(' ')[0]}!`;

  // ─── Recent transactions (last 6) ───
  renderRecentTransactions(txs.slice(0, 6));

  // ─── Monthly bar chart ───
  renderMonthlyChart(txs, now);
}

/**
 * Render the recent transactions list on the dashboard.
 * @param {Array} recent - Array of up to 6 transaction objects
 */
function renderRecentTransactions(recent) {
  const list = document.getElementById('recent-tx-list');

  if (!recent.length) {
    list.innerHTML = '<li style="color:var(--muted);font-size:13px;padding:20px 0;text-align:center">No transactions yet</li>';
    return;
  }

  list.innerHTML = recent.map(t => `
    <li class="tx-item">
      <div class="tx-icon" style="background:${t.type === 'income' ? '#2ecc7120' : '#e74c3c20'}">
        ${CAT_ICONS[t.cat] || '💰'}
      </div>
      <div class="tx-info">
        <div class="tx-name">${t.desc}</div>
        <div class="tx-cat">${t.cat}</div>
      </div>
      <div class="tx-amount ${t.type}">
        ${t.type === 'income' ? '+' : '-'}₹${t.amount.toLocaleString()}
      </div>
      <div class="tx-date">${formatDate(t.date)}</div>
    </li>`).join('');
}

/**
 * Build and render the 6-month grouped bar chart.
 * Destroys the previous chart instance first.
 * @param {Array} txs  - All user transactions
 * @param {Date}  now  - Current date
 */
function renderMonthlyChart(txs, now) {
  const labels      = [];
  const incomeData  = [];
  const expenseData = [];

  // Collect data for the last 6 months (oldest → newest)
  for (let i = 5; i >= 0; i--) {
    const ref  = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr   = ref.getFullYear();
    const mo   = ref.getMonth();

    labels.push(ref.toLocaleString('default', { month: 'short' }));

    const monthTx = txs.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === yr && d.getMonth() === mo;
    });

    incomeData.push( monthTx.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0));
    expenseData.push(monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  }

  // Destroy old chart before creating new one
  if (charts.monthly) charts.monthly.destroy();

  charts.monthly = new Chart(document.getElementById('chart-monthly'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#2ecc7133',
          borderColor: '#2ecc71',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: '#e74c3c33',
          borderColor: '#e74c3c',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#6b6b8a', font: { family: 'DM Mono', size: 11 } } },
      },
      scales: {
        x: { ticks: { color: '#6b6b8a' }, grid: { color: '#2a2a3a' } },
        y: {
          ticks: { color: '#6b6b8a', callback: v => '₹' + (v / 1000) + 'k' },
          grid:  { color: '#2a2a3a' },
        },
      },
    },
  });
}