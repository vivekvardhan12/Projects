/* ============================================================
   js/analytics.js
   Analytics page rendering:
   - Doughnut chart: expense by category
   - Bar chart: income vs expense over 6 months
   - Line chart: daily spending trend (last 30 days)
   - Top categories progress bar list
   ============================================================ */

/**
 * Render all charts and the top-categories list on the Analytics page.
 * Called every time the user navigates to Analytics.
 */
function renderAnalytics() {
  const txs      = getTx();
  const expenses = txs.filter(t => t.type === 'expense');

  renderPieChart(expenses);
  renderBarChart(txs);
  renderLineChart(expenses);
  renderTopCategories(expenses);
}

/**
 * Doughnut chart — expense breakdown by category.
 * @param {Array} expenses - expense transactions only
 */
function renderPieChart(expenses) {
  // Aggregate amount per category
  const catMap = {};
  expenses.forEach(t => {
    catMap[t.cat] = (catMap[t.cat] || 0) + t.amount;
  });

  // Sort highest → lowest so the biggest slice comes first
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  if (charts.pie) charts.pie.destroy();

  if (!sorted.length) return; // nothing to show

  charts.pie = new Chart(document.getElementById('chart-pie'), {
    type: 'doughnut',
    data: {
      labels: sorted.map(([k]) => k),
      datasets: [{
        data: sorted.map(([, v]) => v),
        backgroundColor: CAT_COLORS,
        borderColor: '#12121a',
        borderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#6b6b8a', font: { family: 'DM Mono', size: 11 }, padding: 12 },
        },
      },
    },
  });
}

/**
 * Grouped bar chart — income vs expense for the last 6 months.
 * @param {Array} txs - all transactions
 */
function renderBarChart(txs) {
  const now        = new Date();
  const labels     = [];
  const incomeArr  = [];
  const expenseArr = [];

  for (let i = 5; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr  = ref.getFullYear();
    const mo  = ref.getMonth();

    labels.push(ref.toLocaleString('default', { month: 'short' }));

    const mTx = txs.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === yr && d.getMonth() === mo;
    });

    incomeArr.push( mTx.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0));
    expenseArr.push(mTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  }

  if (charts.bar) charts.bar.destroy();

  charts.bar = new Chart(document.getElementById('chart-bar'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',  data: incomeArr,  backgroundColor: '#2ecc7133', borderColor: '#2ecc71', borderWidth: 2, borderRadius: 6 },
        { label: 'Expense', data: expenseArr, backgroundColor: '#e74c3c33', borderColor: '#e74c3c', borderWidth: 2, borderRadius: 6 },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#6b6b8a', font: { family: 'DM Mono', size: 11 } } } },
      scales: {
        x: { ticks: { color: '#6b6b8a' }, grid: { color: '#2a2a3a' } },
        y: { ticks: { color: '#6b6b8a', callback: v => '₹' + (v / 1000) + 'k' }, grid: { color: '#2a2a3a' } },
      },
    },
  });
}

/**
 * Line chart — daily expense totals for the last 30 days.
 * @param {Array} expenses - expense transactions only
 */
function renderLineChart(expenses) {
  const labels   = [];
  const amounts  = [];

  for (let i = 29; i >= 0; i--) {
    const d  = new Date();
    d.setDate(d.getDate() - i);
    const ds = fmtDate(d);

    // Human-readable label for today / yesterday / older
    if      (i === 0) labels.push('Today');
    else if (i === 1) labels.push('Yesterday');
    else              labels.push(`${d.getDate()}/${d.getMonth() + 1}`);

    amounts.push(
      expenses.filter(t => t.date === ds).reduce((s, t) => s + t.amount, 0)
    );
  }

  if (charts.line) charts.line.destroy();

  charts.line = new Chart(document.getElementById('chart-line'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Daily Expense',
        data: amounts,
        borderColor: '#7c5cfc',
        backgroundColor: '#7c5cfc18',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#7c5cfc',
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#6b6b8a', font: { family: 'DM Mono', size: 11 } } } },
      scales: {
        x: { ticks: { color: '#6b6b8a', maxTicksLimit: 10 }, grid: { color: '#2a2a3a' } },
        y: { ticks: { color: '#6b6b8a', callback: v => '₹' + v.toLocaleString() }, grid: { color: '#2a2a3a' } },
      },
    },
  });
}

/**
 * Render the "Top Spending Categories" section as horizontal progress bars.
 * @param {Array} expenses - expense transactions only
 */
function renderTopCategories(expenses) {
  const catMap = {};
  expenses.forEach(t => {
    catMap[t.cat] = (catMap[t.cat] || 0) + t.amount;
  });

  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxVal = sorted[0]?.[1] || 1; // avoid division by zero

  const el = document.getElementById('top-cats');

  if (!sorted.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px">No expense data yet</div>';
    return;
  }

  el.innerHTML = sorted.map(([cat, val], i) => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
        <span>${CAT_ICONS[cat] || '•'} ${cat}</span>
        <span style="color:var(--muted)">₹${val.toLocaleString()}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${((val / maxVal) * 100).toFixed(1)}%;background:${CAT_COLORS[i]}"></div>
      </div>
    </div>`).join('');
}