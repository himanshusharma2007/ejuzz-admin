// routes/adminManagementRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  getAllProducts,
  removeProduct,
  getProductById,
} = require("../controllers/productManagementController");

// Product management routes
router.get("/:shopId", protect, getAllProducts);
router.get("/:id", protect, getProductById);
router.delete("/:id", protect, removeProduct);

module.exports = router;
