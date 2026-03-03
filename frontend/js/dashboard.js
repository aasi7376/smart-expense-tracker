// ── Auth Guard ────────────────────────────────────────────────
requireAuth();

// ── State ─────────────────────────────────────────────────────
let currentMonth    = getCurrentMonth();
let categoryExpenses = [];

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  setMonthFilter();
  loadDashboard();
});

// ── Load User Info ────────────────────────────────────────────
const loadUserInfo = () => {
  const user = getUser();
  if (!user) return;
  document.getElementById('userName').textContent   = user.name  || 'User';
  document.getElementById('userEmail').textContent  = user.email || '';
  document.getElementById('userAvatar').textContent = (user.name || 'U')[0].toUpperCase();
};

// ── Set Month Filter ──────────────────────────────────────────
const setMonthFilter = () => {
  const input = document.getElementById('monthFilter');
  if (input) input.value = currentMonth;
};

// ── Load Dashboard ────────────────────────────────────────────
const loadDashboard = async () => {
  const input  = document.getElementById('monthFilter');
  currentMonth = input ? input.value : getCurrentMonth();

  await Promise.all([
    loadSummary(),
    loadCharts(),
    loadRecentTransactions(),
  ]);
};

// ── Load Summary Cards ────────────────────────────────────────
const loadSummary = async () => {
  try {
    const data = await summaryAPI.getSummary({ month: currentMonth });
    const s    = data.summary;

    document.getElementById('totalIncome').textContent  = formatCurrency(s.total_income);
    document.getElementById('totalExpense').textContent = formatCurrency(s.total_expense);

    const balance   = Number(s.balance || 0);
    const balanceEl = document.getElementById('totalBalance');
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.className   = `card-amount ${balance >= 0 ? 'income' : 'expense'}`;

    document.getElementById('transactionCount').textContent =
      `${s.transaction_count || 0} transactions`;
  } catch (err) {
    console.error('Summary error:', err);
  }
};

// ── Load Charts ───────────────────────────────────────────────
const loadCharts = async () => {
  try {
    const year = currentMonth.split('-')[0];

    const [monthlyData, categoryData] = await Promise.all([
      summaryAPI.getMonthly(year),
      summaryAPI.getCategory({ month: currentMonth, type: 'expense' }),
    ]);

    categoryExpenses = categoryData.categories || [];

    renderBarChart(monthlyData.monthly     || []);
    renderPieChart(categoryExpenses);
    renderBudgetGrid(categoryExpenses);
    checkBudgetAlerts(categoryExpenses);
  } catch (err) {
    console.error('Charts error:', err);
  }
};

// ── Render Budget Grid ────────────────────────────────────────
const renderBudgetGrid = (categories) => {
  const grid    = document.getElementById('budgetGrid');
  const budgets = getBudgets();

  if (!categories || categories.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No expense categories this month.</p>';
    return;
  }

  grid.innerHTML = categories.map(cat => {
    const budget   = budgets[cat.category_id] || '';
    const spent    = parseFloat(cat.total) || 0;
    const limit    = parseFloat(budget) || 0;
    const pct      = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const barClass = pct >= 100 ? 'exceeded' : pct >= 80 ? 'warning' : '';

    return `
      <div class="budget-item">
        <div class="budget-item-label">
          ${getCategoryIcon(cat.category_name)} ${cat.category_name}
        </div>
        <div class="budget-item-input">
          <input
            type="number"
            id="budget_${cat.category_id}"
            placeholder="Set limit"
            value="${budget}"
            min="0"
          />
        </div>
        ${limit > 0 ? `
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">
            ₹${spent.toLocaleString('en-IN')} / ₹${limit.toLocaleString('en-IN')}
          </div>
          <div class="budget-progress">
            <div class="budget-progress-bar ${barClass}" style="width:${pct}%"></div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};

// ── Save Budget Limits ────────────────────────────────────────
const saveBudgetLimits = () => {
  const budgets = getBudgets();

  categoryExpenses.forEach(cat => {
    const input = document.getElementById(`budget_${cat.category_id}`);
    if (input && input.value) {
      budgets[cat.category_id] = parseFloat(input.value);
    } else {
      delete budgets[cat.category_id];
    }
  });

  saveBudgets(budgets);
  checkBudgetAlerts(categoryExpenses);
  renderBudgetGrid(categoryExpenses);
  showAlert('budgetAlerts', '✅ Budget limits saved!', 'success');
};

// ── Check Budget Alerts ───────────────────────────────────────
const checkBudgetAlerts = (categories) => {
  const alertsEl = document.getElementById('budgetAlerts');
  const budgets  = getBudgets();

  if (!alertsEl) return;

  const alerts = [];

  categories.forEach(cat => {
    const limit = parseFloat(budgets[cat.category_id]) || 0;
    const spent = parseFloat(cat.total) || 0;
    if (limit <= 0) return;

    const pct = (spent / limit) * 100;

    if (pct >= 100) {
      alerts.push(`
        <div class="budget-alert-item">
          <div class="budget-alert-icon">🚨</div>
          <div class="budget-alert-text">
            <strong>Budget exceeded!</strong>
            ${getCategoryIcon(cat.category_name)} ${cat.category_name} —
            spent ₹${spent.toLocaleString('en-IN')} of
            ₹${limit.toLocaleString('en-IN')} limit
          </div>
        </div>
      `);
    } else if (pct >= 80) {
      alerts.push(`
        <div class="budget-alert-item warning">
          <div class="budget-alert-icon">⚠️</div>
          <div class="budget-alert-text">
            <strong>Nearing budget limit!</strong>
            ${getCategoryIcon(cat.category_name)} ${cat.category_name} —
            ${pct.toFixed(0)}% used
            (₹${spent.toLocaleString('en-IN')} /
             ₹${limit.toLocaleString('en-IN')})
          </div>
        </div>
      `);
    }
  });

  alertsEl.innerHTML = alerts.join('');
};

// ── Load Recent Transactions ──────────────────────────────────
const loadRecentTransactions = async () => {
  try {
    const data = await summaryAPI.getRecent(5);
    const list = document.getElementById('recentList');

    if (!data.transactions || data.transactions.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No transactions yet</h3>
          <p>Add your first transaction to get started</p>
        </div>`;
      return;
    }

    list.innerHTML = data.transactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-icon ${tx.type}">
          ${getCategoryIcon(tx.category_name)}
        </div>
        <div class="transaction-info">
          <div class="transaction-name">${tx.category_name}</div>
          <div class="transaction-date">
            ${tx.description ? tx.description + ' · ' : ''}${formatDate(tx.date)}
          </div>
        </div>
        <div class="transaction-amount ${tx.type}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Recent transactions error:', err);
  }
};

// ── Logout ────────────────────────────────────────────────────
const handleLogout = () => {
  removeToken();
  removeUser();
  window.location.href = 'login.html';
};