// ── Constants ─────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ── Token Helpers ─────────────────────────────────────────────
const getToken    = ()        => localStorage.getItem('token');
const setToken    = (token)   => localStorage.setItem('token', token);
const removeToken = ()        => localStorage.removeItem('token');

const getUser     = ()        => JSON.parse(localStorage.getItem('user') || '{}');
const setUser     = (user)    => localStorage.setItem('user', JSON.stringify(user));
const removeUser  = ()        => localStorage.removeItem('user');

// ── Auth Guard ────────────────────────────────────────────────
const requireAuth = () => {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
};

const redirectIfAuth = () => {
  if (getToken()) {
    window.location.href = 'dashboard.html';
  }
};

// ── Format Currency ───────────────────────────────────────────
const formatCurrency = (amount) => {
  return '₹' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ── Format Date ───────────────────────────────────────────────
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  });
};

// ── Current Month ─────────────────────────────────────────────
const getCurrentMonth = () => {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// ── Show Alert ────────────────────────────────────────────────
const showAlert = (id, message, type = 'error') => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent  = message;
  el.className    = `alert alert-${type} show`;
  setTimeout(() => { el.className = `alert alert-${type}`; }, 4000);
};

// ── Set Button Loading ────────────────────────────────────────
const setLoading = (btnId, loading) => {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled             = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML            = '<span class="spinner"></span>';
  } else {
    btn.disabled    = false;
    btn.textContent = btn.dataset.originalText || 'Submit';
  }
};

// ── Category Icons ────────────────────────────────────────────
const categoryIcons = {
  'Salary':        '💼',
  'Freelance':     '💻',
  'Investment':    '📈',
  'Business':      '🏢',
  'Other Income':  '💵',
  'Food':          '🍔',
  'Transport':     '🚗',
  'Shopping':      '🛍️',
  'Healthcare':    '🏥',
  'Education':     '📚',
  'Entertainment': '🎬',
  'Utilities':     '💡',
  'Rent':          '🏠',
  'Other Expense': '💸',
};

const getCategoryIcon = (name) => categoryIcons[name] || '💰';
// ── Theme Toggle ──────────────────────────────────────────────
const initTheme = () => {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    document.body.classList.add('light-mode');
  }
  updateThemeBtn();
};

const toggleTheme = () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateThemeBtn();
};

const updateThemeBtn = () => {
  const btns = document.querySelectorAll('.btn-theme');
  const isLight = document.body.classList.contains('light-mode');
  btns.forEach(btn => btn.textContent = isLight ? '🌙' : '☀️');
};

// ── Export to Excel (CSV) ─────────────────────────────────────
const exportToCSV = (transactions) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export!');
    return;
  }

  const headers = ['#', 'Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows    = transactions.map((tx, i) => [
    i + 1,
    formatDate(tx.date),
    tx.type,
    tx.category_name,
    tx.description || '',
    tx.type === 'income' ? tx.amount : -tx.amount,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${val}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `transactions_${getCurrentMonth()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Export to PDF ─────────────────────────────────────────────
const exportToPDF = (transactions) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export!');
    return;
  }

  const user    = getUser();
  const month   = getCurrentMonth();
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const rows = transactions.map((tx, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${formatDate(tx.date)}</td>
      <td><span class="${tx.type}">${tx.type}</span></td>
      <td>${getCategoryIcon(tx.category_name)} ${tx.category_name}</td>
      <td>${tx.description || '—'}</td>
      <td class="${tx.type}">${tx.type === 'income' ? '+' : '-'}₹${Number(tx.amount).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <title>Transactions Report</title>
      <style>
        body        { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
        h1          { font-size: 22px; margin-bottom: 4px; }
        .meta       { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        .summary    { display: flex; gap: 20px; margin-bottom: 24px; }
        .s-card     { padding: 14px 20px; border-radius: 8px; min-width: 140px; }
        .s-income   { background: #dcfce7; color: #15803d; }
        .s-expense  { background: #fee2e2; color: #b91c1c; }
        .s-balance  { background: #ede9fe; color: #6d28d9; }
        .s-label    { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
        .s-amount   { font-size: 20px; font-weight: 800; }
        table       { width: 100%; border-collapse: collapse; font-size: 13px; }
        th          { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        td          { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        .income     { color: #16a34a; font-weight: 600; }
        .expense    { color: #dc2626; font-weight: 600; }
      </style>
    </head>
    <body>
      <h1>💰 Smart Expense Tracker</h1>
      <div class="meta">Report for ${month} · Generated for ${user.name || 'User'}</div>
      <div class="summary">
        <div class="s-card s-income">
          <div class="s-label">Total Income</div>
          <div class="s-amount">₹${income.toLocaleString('en-IN')}</div>
        </div>
        <div class="s-card s-expense">
          <div class="s-label">Total Expense</div>
          <div class="s-amount">₹${expense.toLocaleString('en-IN')}</div>
        </div>
        <div class="s-card s-balance">
          <div class="s-label">Balance</div>
          <div class="s-amount">₹${balance.toLocaleString('en-IN')}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Date</th><th>Type</th>
            <th>Category</th><th>Description</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
};

// ── Budget Helpers ────────────────────────────────────────────
const getBudgets  = ()         => JSON.parse(localStorage.getItem('budgets')  || '{}');
const saveBudgets = (budgets)  => localStorage.setItem('budgets', JSON.stringify(budgets));

// ── Init theme on every page ──────────────────────────────────
document.addEventListener('DOMContentLoaded', initTheme);