const pool = require('../config/db');

// POST /api/transactions
const addTransaction = async (req, res) => {
  const { type, amount, category_id, description, date } = req.body;
  const user_id = req.user.id;

  if (!type || !amount || !category_id || !date) {
    return res.status(400).json({ success: false, message: 'type, amount, category_id, and date are required.' });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ success: false, message: 'type must be "income" or "expense".' });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'amount must be a positive number.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, category_id, description, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, type, amount, category_id, description || null, date]
    );

    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, message: 'Transaction added.', transaction: rows[0] });
  } catch (err) {
    console.error('Add transaction error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/transactions
const getTransactions = async (req, res) => {
  const user_id = req.user.id;
  const { month, type, category_id, page = 1, limit = 20 } = req.query;

  let conditions = ['t.user_id = ?'];
  let params     = [user_id];

  if (month) {
    conditions.push('DATE_FORMAT(t.date, "%Y-%m") = ?');
    params.push(month);
  }

  if (type && ['income', 'expense'].includes(type)) {
    conditions.push('t.type = ?');
    params.push(type);
  }

  if (category_id) {
    conditions.push('t.category_id = ?');
    params.push(category_id);
  }

  const WHERE  = conditions.join(' AND ');
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions t WHERE ${WHERE}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT t.id, t.type, t.amount, t.description, t.date,
              c.id AS category_id, c.name AS category_name,
              t.created_at
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE ${WHERE}
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    return res.status(200).json({ success: true, total, page: Number(page), limit: Number(limit), transactions: rows });
  } catch (err) {
    console.error('Get transactions error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/transactions/:id
const getTransaction = async (req, res) => {
  const { id }  = req.params;
  const user_id = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({ success: true, transaction: rows[0] });
  } catch (err) {
    console.error('Get transaction error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  const { id }                                           = req.params;
  const user_id                                          = req.user.id;
  const { type, amount, category_id, description, date } = req.body;

  if (!type || !amount || !category_id || !date) {
    return res.status(400).json({ success: false, message: 'All fields are required for update.' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    await pool.query(
      `UPDATE transactions
       SET type = ?, amount = ?, category_id = ?, description = ?, date = ?
       WHERE id = ? AND user_id = ?`,
      [type, amount, category_id, description || null, date, id, user_id]
    );

    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    return res.status(200).json({ success: true, message: 'Transaction updated.', transaction: rows[0] });
  } catch (err) {
    console.error('Update transaction error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  const { id }  = req.params;
  const user_id = req.user.id;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, user_id]);

    return res.status(200).json({ success: true, message: 'Transaction deleted.' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { addTransaction, getTransactions, getTransaction, updateTransaction, deleteTransaction };