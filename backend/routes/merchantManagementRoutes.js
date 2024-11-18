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

router.use(checkMerchantManagementPermission)

router.get("/", protect, getAllMerchants);
router.get("/pending-verification", protect, getPendingVerifications);
router.get("/:id", protect, getMerchantDetails);
router.patch("/:id/verify", protect, handleMerchantVerification);
router.patch("/:id/status", protect, updateMerchantStatus);

module.exports = router;
