// ── Redirect if already logged in ─────────────────────────────
redirectIfAuth();

// ── Handle Login ──────────────────────────────────────────────
const handleLogin = async () => {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showAlert('alertMsg', 'Please fill in all fields.');
    return;
  }

  try {
    setLoading('loginBtn', true);
    const data = await authAPI.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showAlert('alertMsg', err.message);
  } finally {
    setLoading('loginBtn', false);
  }
};

// ── Handle Register ───────────────────────────────────────────
const handleRegister = async () => {
  const name            = document.getElementById('name')?.value.trim();
  const email           = document.getElementById('email').value.trim();
  const password        = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword')?.value.trim();

  if (!name || !email || !password || !confirmPassword) {
    showAlert('alertMsg', 'Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    showAlert('alertMsg', 'Password must be at least 6 characters.');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('alertMsg', 'Passwords do not match.');
    return;
  }

  try {
    setLoading('registerBtn', true);
    const data = await authAPI.register({ name, email, password });
    setToken(data.token);
    setUser(data.user);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showAlert('alertMsg', err.message);
  } finally {
    setLoading('registerBtn', false);
  }
};

// ── Handle Logout ─────────────────────────────────────────────
const handleLogout = () => {
  removeToken();
  removeUser();
  window.location.href = 'login.html';
};

// ── Enter Key Support ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const loginBtn    = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  if (loginBtn)    handleLogin();
  if (registerBtn) handleRegister();
});