const express = require("express");
const router = express.Router();
const {
  getAllMerchants,
  getMerchantDetails,
  handleMerchantVerification,
  updateMerchantStatus,
  getPendingVerifications,
  checkMerchantManagementPermission
} = require("../controllers/merchantManagementController");

const { protect } = require("../middlewares/auth");


router.get("/", protect,checkMerchantManagementPermission, getAllMerchants);
router.get("/pending-verification", protect,checkMerchantManagementPermission, getPendingVerifications);
router.get("/:id", protect,checkMerchantManagementPermission, getMerchantDetails);
router.patch("/:id/verify", protect,checkMerchantManagementPermission, handleMerchantVerification);
router.patch("/:id/status", protect,checkMerchantManagementPermission, updateMerchantStatus);

module.exports = router;
