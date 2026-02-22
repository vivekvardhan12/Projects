/* ============================================================
   js/auth.js
   Authentication: login, register, logout, session restore.
   currentUser is a global so other modules can use it.
   ============================================================ */

// Currently logged-in user. null = not logged in.
// Shape: { username: string, name: string }
let currentUser = null;

/**
 * Switch between the Login and Register tab on the auth screen.
 * @param {'login'|'register'} tab
 */
function switchTab(tab) {
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';

  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}

/**
 * Handle login form submission.
 * Reads credentials from the DOM, validates against stored users.
 */
function login() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const errEl    = document.getElementById('login-error');

  if (!username || !password) {
    showError(errEl, 'Please fill all fields');
    return;
  }

  const users = DB.get('sw_users', {});

  if (!users[username] || users[username].password !== password) {
    showError(errEl, 'Invalid username or password');
    return;
  }

  errEl.style.display = 'none';
  currentUser = { username, name: users[username].name };
  DB.set('sw_session', currentUser);
  initApp();
}

/**
 * Handle register form submission.
 * Validates input, creates a new user in storage, then logs in.
 */
function register() {
  const name     = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-user').value.trim().toLowerCase();
  const password = document.getElementById('reg-pass').value;
  const errEl    = document.getElementById('reg-error');

  if (!name || !username || !password) {
    showError(errEl, 'Please fill all fields');
    return;
  }

  if (password.length < 6) {
    showError(errEl, 'Password must be at least 6 characters');
    return;
  }

  const users = DB.get('sw_users', {});

  if (users[username]) {
    showError(errEl, 'Username already exists');
    return;
  }

  // Save new user
  users[username] = { name, password };
  DB.set('sw_users', users);

  errEl.style.display = 'none';
  currentUser = { username, name };
  DB.set('sw_session', currentUser);
  initApp();
}

/**
 * Log the user out: clear session, hide app, show auth screen.
 */
function logout() {
  DB.set('sw_session', null);
  currentUser = null;

  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';

  // Destroy all Chart.js instances to prevent canvas reuse errors
  Object.values(charts).forEach(c => c && c.destroy && c.destroy());
  charts = {};
}

/**
 * Show an error message in an error element.
 * @param {HTMLElement} el
 * @param {string} msg
 */
function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// ─── Restore session on page load ───
window.addEventListener('load', () => {
  const session = DB.get('sw_session', null);
  if (session) {
    currentUser = session;
    initApp(); // defined in app.js
  }
});