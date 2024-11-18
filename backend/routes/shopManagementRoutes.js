// routes/adminManagementRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  getAllShops,
  getShopPerformance,
  getShopById,
} = require("../controllers/shopManagementController");

// Shop management routes
router.get("/", protect, getAllShops);
router.get("/:id", protect, getShopById);
router.get("/:id/performance", protect, getShopPerformance);

module.exports = router;
