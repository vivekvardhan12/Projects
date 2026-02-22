/* ============================================================
   js/app.js
   Application bootstrap and navigation.
   - initApp()            Show app, set up dropdowns, go to dashboard
   - navigate(page)       Switch between pages
   - populateCategorySelects()  Fill category <select> elements
   ============================================================ */

/**
 * Initialize the app after a successful login.
 * Hides the auth screen, shows the app shell,
 * sets up dropdowns, and navigates to the Dashboard.
 */
function initApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display         = 'block';

  // Show the logged-in user's name in the sidebar
  document.getElementById('sidebar-username').textContent = currentUser.name;

  populateCategorySelects();
  navigate('dashboard');
}

/**
 * Populate all category <select> dropdowns:
 *   - #filter-cat    (Transactions filter — all categories)
 *   - #budget-cat-sel (Budget page — expense categories only)
 *   - #add-cat       (Add form — set by setType(), called below)
 */
function populateCategorySelects() {
  // ── Transactions filter dropdown (all categories) ──
  const filterCat = document.getElementById('filter-cat');
  filterCat.innerHTML = '<option value="all">All Categories</option>';
  [...CATEGORIES.income, ...CATEGORIES.expense].forEach(c => {
    filterCat.innerHTML += `<option value="${c}">${c}</option>`;
  });

  // ── Budget category dropdown (expense categories only) ──
  const budgetCat = document.getElementById('budget-cat-sel');
  budgetCat.innerHTML = '';
  CATEGORIES.expense.forEach(c => {
    budgetCat.innerHTML += `<option value="${c}">${c}</option>`;
  });

  // ── Add-transaction category dropdown ──
  // Default to 'income' type on page load
  setType('income');
}

/**
 * Navigate to a named page.
 * Hides all pages, shows the target page, updates sidebar active state,
 * and triggers that page's render function.
 *
 * @param {'dashboard'|'transactions'|'add'|'analytics'|'budget'} page
 */
function navigate(page) {
  // Deactivate all pages and nav items
  document.querySelectorAll('.page').forEach(p     => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Activate target page and its nav item
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');

  // Call the render function for the target page
  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;

    case 'transactions':
      renderTransactions();
      break;

    case 'add':
      // Pre-fill today's date in the add form
      document.getElementById('add-date').value = fmtDate(new Date());
      break;

    case 'analytics':
      renderAnalytics();
      break;

    case 'budget':
      renderBudget();
      break;
  }
}
