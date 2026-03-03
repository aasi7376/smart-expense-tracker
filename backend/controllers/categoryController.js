const pool = require('../config/db');

// GET /api/categories
const getCategories = async (req, res) => {
  const { type } = req.query;

  let query  = 'SELECT * FROM categories';
  let params = [];

  if (type && ['income', 'expense'].includes(type)) {
    query  += ' WHERE type = ?';
    params.push(type);
  }

  query += ' ORDER BY type, name';

  try {
    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, categories: rows });
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCategories };