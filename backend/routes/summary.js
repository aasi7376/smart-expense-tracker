const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getSummary,
  getMonthlySummary,
  getCategorySummary,
  getRecentTransactions,
} = require('../controllers/summaryController');

router.use(verifyToken);

router.get('/',         getSummary);
router.get('/monthly',  getMonthlySummary);
router.get('/category', getCategorySummary);
router.get('/recent',   getRecentTransactions);

module.exports = router;