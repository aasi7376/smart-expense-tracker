const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/auth');
const {
  addTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

router.use(verifyToken);

router.post('/',      addTransaction);
router.get('/',       getTransactions);
router.get('/:id',    getTransaction);
router.put('/:id',    updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;