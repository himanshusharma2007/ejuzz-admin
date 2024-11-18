const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerDetails,
  updateCustomerStatus,
  getCustomerTransactions,
  updateWalletBalance,
  checkCustomerManagementPermission,
} = require("../controllers/customerManagementController");
const { protect } = require("../middlewares/auth");

// Apply permission middleware to all routes

// Customer management routes
router.get("/", protect, checkCustomerManagementPermission, getAllCustomers);
router.get(
  "/:id",
  protect,
  checkCustomerManagementPermission,
  getCustomerDetails
);
router.patch(
  "/:id/status",
  protect,
  checkCustomerManagementPermission,
  updateCustomerStatus
);
router.get(
  "/:id/transactions",
  protect,
  checkCustomerManagementPermission,
  getCustomerTransactions
);
router.patch(
  "/:id/wallet",
  protect,
  checkCustomerManagementPermission,
  updateWalletBalance
);

module.exports = router;
