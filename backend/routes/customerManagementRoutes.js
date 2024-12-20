const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerDetails,
  updateCustomerStatus,
  getCustomerTransactions,
  updateWalletBalance,
  checkCustomerManagementPermission,
  verifyCustomer,
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
router.patch(
  "/:id/verification",
  protect,
  checkCustomerManagementPermission,
  verifyCustomer
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
