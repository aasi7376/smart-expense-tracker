// ── Base Request ──────────────────────────────────────────────
const request = async (endpoint, method = 'GET', body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token   = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res  = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
};

// ── Auth API ──────────────────────────────────────────────────
const authAPI = {
  register: (body) => request('/auth/register', 'POST', body),
  login:    (body) => request('/auth/login',    'POST', body),
  profile:  ()     => request('/auth/profile'),
};

// ── Transactions API ──────────────────────────────────────────
const transactionsAPI = {
  getAll:  (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? '?' + query : ''}`);
  },
  getOne:  (id)   => request(`/transactions/${id}`),
  add:     (body) => request('/transactions',     'POST',   body),
  update:  (id, body) => request(`/transactions/${id}`, 'PUT', body),
  delete:  (id)   => request(`/transactions/${id}`, 'DELETE'),
};

// ── Summary API ───────────────────────────────────────────────
const summaryAPI = {
  getSummary:  (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/summary${query ? '?' + query : ''}`);
  },
  getMonthly:  (year)  => request(`/summary/monthly?year=${year}`),
  getCategory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/summary/category${query ? '?' + query : ''}`);
  },
  getRecent:   (limit = 5) => request(`/summary/recent?limit=${limit}`),
};

// ── Categories API ────────────────────────────────────────────
const categoriesAPI = {
  getAll:  (type = '') => request(`/categories${type ? '?type=' + type : ''}`),
};