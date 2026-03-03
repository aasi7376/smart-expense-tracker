const express     = require('express');
const router      = express.Router();
const verifyToken = require('../middleware/auth');
const { getCategories } = require('../controllers/categoryController');

router.use(verifyToken);

router.get('/', getCategories);

module.exports = router;