// ── Auth Guard ────────────────────────────────────────────────
requireAuth();

// ── State ─────────────────────────────────────────────────────
let currentPage      = 1;
let totalRecords     = 0;
let editingId        = null;
let allTransactions  = [];
let searchTimeout    = null;
const LIMIT          = 10;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  loadFilterCategories();
  loadTransactions();
  setDefaultDate();
});

// ── Load User Info ────────────────────────────────────────────
const loadUserInfo = () => {
  const user = getUser();
  if (!user) return;
  document.getElementById('userName').textContent   = user.name  || 'User';
  document.getElementById('userEmail').textContent  = user.email || '';
  document.getElementById('userAvatar').textContent = (user.name || 'U')[0].toUpperCase();
};

// ── Set Default Date ──────────────────────────────────────────
const setDefaultDate = () => {
  const dateInput = document.getElementById('txDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
};

// ── Load Filter Categories ────────────────────────────────────
const loadFilterCategories = async () => {
  try {
    const data = await categoriesAPI.getAll();
    const sel  = document.getElementById('filterCategory');
    data.categories.forEach(c => {
      const opt       = document.createElement('option');
      opt.value       = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error('Filter categories error:', err);
  }
};

// ── Load Categories for Modal ─────────────────────────────────
const loadCategories = async () => {
  const type = document.getElementById('txType').value;
  try {
    const data = await categoriesAPI.getAll(type);
    const sel  = document.getElementById('txCategory');
    sel.innerHTML = '';
    data.categories.forEach(c => {
      const opt       = document.createElement('option');
      opt.value       = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error('Load categories error:', err);
  }
};

// ── Load Transactions ─────────────────────────────────────────
const loadTransactions = async () => {
  const params = { page: currentPage, limit: LIMIT };

  const month    = document.getElementById('filterMonth')?.value;
  const type     = document.getElementById('filterType')?.value;
  const category = document.getElementById('filterCategory')?.value;
  const search   = document.getElementById('searchInput')?.value.trim();

  if (month)    params.month       = month;
  if (type)     params.type        = type;
  if (category) params.category_id = category;

  try {
    const data      = await transactionsAPI.getAll(params);
    allTransactions = data.transactions || [];
    totalRecords    = data.total;

    // Client side search filter
    const filtered = search
      ? allTransactions.filter(tx =>
          tx.category_name.toLowerCase().includes(search.toLowerCase()) ||
          (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()))
        )
      : allTransactions;

    renderTable(filtered);
    renderPagination();
  } catch (err) {
    console.error('Load transactions error:', err);
  }
};

// ── Handle Search ─────────────────────────────────────────────
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const search   = document.getElementById('searchInput')?.value.trim();
    const filtered = search
      ? allTransactions.filter(tx =>
          tx.category_name.toLowerCase().includes(search.toLowerCase()) ||
          (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()))
        )
      : allTransactions;
    renderTable(filtered);
  }, 300);
};

// ── Render Table ──────────────────────────────────────────────
const renderTable = (transactions) => {
  const tbody = document.getElementById('transactionTableBody');

  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No transactions found</h3>
          <p>Add your first transaction to get started</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = transactions.map((tx, i) => `
    <tr>
      <td>${(currentPage - 1) * LIMIT + i + 1}</td>
      <td>${formatDate(tx.date)}</td>
      <td><span class="badge-${tx.type}">${tx.type}</span></td>
      <td>
        <div class="td-category">
          ${getCategoryIcon(tx.category_name)} ${tx.category_name}
        </div>
      </td>
      <td class="text-muted">${tx.description || '—'}</td>
      <td class="transaction-amount ${tx.type}">
        ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn-edit"   onclick="openEditModal(${tx.id})">Edit</button>
          <button class="btn-delete" onclick="deleteTransaction(${tx.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
};

// ── Render Pagination ─────────────────────────────────────────
const renderPagination = () => {
  const totalPages = Math.ceil(totalRecords / LIMIT);
  const start      = totalRecords === 0 ? 0 : (currentPage - 1) * LIMIT + 1;
  const end        = Math.min(currentPage * LIMIT, totalRecords);

  document.getElementById('paginationInfo').textContent =
    `Showing ${start}–${end} of ${totalRecords} results`;

  document.getElementById('prevBtn').disabled = currentPage <= 1;
  document.getElementById('nextBtn').disabled = currentPage >= totalPages;
};

// ── Change Page ───────────────────────────────────────────────
const changePage = (dir) => {
  currentPage += dir;
  loadTransactions();
};

// ── Apply Filters ─────────────────────────────────────────────
const applyFilters = () => {
  currentPage = 1;
  loadTransactions();
};

// ── Reset Filters ─────────────────────────────────────────────
const resetFilters = () => {
  document.getElementById('filterMonth').value    = '';
  document.getElementById('filterType').value     = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('searchInput').value    = '';
  currentPage = 1;
  loadTransactions();
};

// ── Open Modal ────────────────────────────────────────────────
const openModal = () => {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Transaction';
  document.getElementById('txType').value           = 'expense';
  document.getElementById('txAmount').value         = '';
  document.getElementById('txDescription').value    = '';
  setDefaultDate();
  loadCategories();
  document.getElementById('modalOverlay').classList.add('open');
};

// ── Open Edit Modal ───────────────────────────────────────────
const openEditModal = async (id) => {
  try {
    const data = await transactionsAPI.getOne(id);
    const tx   = data.transaction;
    editingId  = id;

    document.getElementById('modalTitle').textContent = 'Edit Transaction';
    document.getElementById('txType').value           = tx.type;
    document.getElementById('txAmount').value         = tx.amount;
    document.getElementById('txDate').value           = tx.date.split('T')[0];
    document.getElementById('txDescription').value    = tx.description || '';

    await loadCategories();
    document.getElementById('txCategory').value = tx.category_id;
    document.getElementById('modalOverlay').classList.add('open');
  } catch (err) {
    console.error('Edit modal error:', err);
  }
};

// ── Close Modal ───────────────────────────────────────────────
const closeModal = () => {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalAlert').className = 'alert alert-error';
  editingId = null;
};

// ── Save Transaction ──────────────────────────────────────────
const saveTransaction = async () => {
  const type        = document.getElementById('txType').value;
  const amount      = document.getElementById('txAmount').value;
  const category_id = document.getElementById('txCategory').value;
  const date        = document.getElementById('txDate').value;
  const description = document.getElementById('txDescription').value;

  if (!amount || !category_id || !date) {
    showAlert('modalAlert', 'Please fill in all required fields.');
    return;
  }

  const body = { type, amount: Number(amount), category_id: Number(category_id), date, description };

  try {
    setLoading('saveBtn', true);
    if (editingId) {
      await transactionsAPI.update(editingId, body);
    } else {
      await transactionsAPI.add(body);
    }
    closeModal();
    loadTransactions();
  } catch (err) {
    showAlert('modalAlert', err.message);
  } finally {
    setLoading('saveBtn', false);
  }
};

// ── Delete Transaction ────────────────────────────────────────
const deleteTransaction = async (id) => {
  if (!confirm('Are you sure you want to delete this transaction?')) return;
  try {
    await transactionsAPI.delete(id);
    loadTransactions();
  } catch (err) {
    console.error('Delete error:', err);
  }
};

// ── Export CSV ────────────────────────────────────────────────
const handleExportCSV = async () => {
  try {
    const data = await transactionsAPI.getAll({ limit: 1000 });
    exportToCSV(data.transactions);
  } catch (err) {
    console.error('Export CSV error:', err);
  }
};

// ── Export PDF ────────────────────────────────────────────────
const handleExportPDF = async () => {
  try {
    const data = await transactionsAPI.getAll({ limit: 1000 });
    exportToPDF(data.transactions);
  } catch (err) {
    console.error('Export PDF error:', err);
  }
};

// ── Logout ────────────────────────────────────────────────────
const handleLogout = () => {
  removeToken();
  removeUser();
  window.location.href = 'login.html';
};