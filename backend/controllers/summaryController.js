const pool = require('../config/db');

// GET /api/summary
const getSummary = async (req, res) => {
  const user_id = req.user.id;
  const { month } = req.query;

  let whereClause = 'user_id = ?';
  let params      = [user_id];

  if (month) {
    whereClause += ' AND DATE_FORMAT(date, "%Y-%m") = ?';
    params.push(month);
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
         SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS balance,
         COUNT(*) AS transaction_count
       FROM transactions
       WHERE ${whereClause}`,
      params
    );

    return res.status(200).json({ success: true, summary: rows[0] });
  } catch (err) {
    console.error('Summary error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getMonthlySummary = async (req, res) => {
  const user_id = req.user.id;
  const year    = req.query.year || new Date().getFullYear();

  try {
    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(date, '%Y-%m')                                   AS month,
         DATE_FORMAT(date, '%b %Y')                                   AS month_label,
         SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END)       AS total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)       AS total_expense,
         SUM(CASE WHEN type = 'income'  THEN amount
                  WHEN type = 'expense' THEN -amount
                  ELSE 0 END)                                         AS balance
       FROM transactions
       WHERE user_id = ? AND YEAR(date) = ?
       GROUP BY DATE_FORMAT(date, '%Y-%m'), DATE_FORMAT(date, '%b %Y')
       ORDER BY month ASC`,
      [user_id, Number(year)]
    );

    return res.status(200).json({ success: true, monthly: rows });
  } catch (err) {
    console.error('Monthly summary error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
const getCategorySummary = async (req, res) => {
  const user_id                     = req.user.id;
  const { month, type = 'expense' } = req.query;

  let whereClause = 't.user_id = ? AND t.type = ?';
  let params      = [user_id, type];

  if (month) {
    whereClause += ' AND DATE_FORMAT(t.date, "%Y-%m") = ?';
    params.push(month);
  }

  try {
    // First get total sum
    const [totalRows] = await pool.query(
      `SELECT SUM(t.amount) AS grand_total
       FROM transactions t
       WHERE ${whereClause}`,
      params
    );

    const grandTotal = parseFloat(totalRows[0].grand_total) || 0;

    const [rows] = await pool.query(
      `SELECT
         c.id   AS category_id,
         c.name AS category_name,
         SUM(t.amount) AS total,
         COUNT(t.id)   AS count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE ${whereClause}
       GROUP BY c.id, c.name
       ORDER BY total DESC`,
      params
    );

    const categories = rows.map(row => ({
      ...row,
      percentage: grandTotal > 0
        ? Math.round((parseFloat(row.total) / grandTotal) * 100 * 100) / 100
        : 0,
    }));

    return res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error('Category summary error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
// GET /api/summary/recent
const getRecentTransactions = async (req, res) => {
  const user_id = req.user.id;
  const limit   = Number(req.query.limit) || 5;

  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.type, t.amount, t.description, t.date,
              c.name AS category_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ?`,
      [user_id, limit]
    );

    return res.status(200).json({ success: true, transactions: rows });
  } catch (err) {
    console.error('Recent transactions error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getSummary, getMonthlySummary, getCategorySummary, getRecentTransactions };