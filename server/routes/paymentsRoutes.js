const express = require('express');
const router = express.Router();
const { 
    getPaymentsOverview, 
    getTransactionDetails,
    updateTransactionStatus,
    getPendingTransactions,
    processDoctorPayout,
    getDoctorPayoutDetails,
    bulkUpdateTransactions
} = require('../controllers/paymentsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/overview', verifyToken, getPaymentsOverview);
router.get('/pending', verifyToken, getPendingTransactions);
router.get('/transaction/:transactionId', verifyToken, getTransactionDetails);
router.put('/transaction/:transactionId/status', verifyToken, updateTransactionStatus);
router.post('/bulk-update', verifyToken, bulkUpdateTransactions);
router.get('/payout/:doctorId', verifyToken, getDoctorPayoutDetails);
router.post('/payout/:doctorId/process', verifyToken, processDoctorPayout);

module.exports = router;
