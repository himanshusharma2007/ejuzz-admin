const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { checkTransactionsManagementPermission, getAllTransactions, getTransactionStats, exportTransactions, getUserTransactions } = require('../controllers/TransactionController ');

router.get('/', protect, checkTransactionsManagementPermission, getAllTransactions);
router.get('/stats', protect, checkTransactionsManagementPermission, getTransactionStats);
router.get('/export', protect, checkTransactionsManagementPermission, exportTransactions);
router.get('/user/:userId/:userType', protect, checkTransactionsManagementPermission, getUserTransactions);

module.exports = router;