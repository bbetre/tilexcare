const express = require('express');
const router = express.Router();
const { getEarningsSummary, getTransactionHistory, getEarningsByPeriod } = require('../controllers/earningsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/summary', verifyToken, getEarningsSummary);
router.get('/transactions', verifyToken, getTransactionHistory);
router.get('/by-period', verifyToken, getEarningsByPeriod);

module.exports = router;
