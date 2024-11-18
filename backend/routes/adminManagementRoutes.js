const express = require("express");
const router = express.Router();

const {
  getAllAdmins,
  getSingleAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminPermissions,
} = require("../controllers/adminManagementController");

const { protect } = require("../middlewares/auth");

// Routes for admin operations
router.get("/", protect, getAllAdmins);
router.post("/", protect, createAdmin);
router.get("/:id", protect, getSingleAdmin);
router.patch("/:id", protect, updateAdmin);
router.delete("/:id", protect, deleteAdmin);
router.patch("/:id/permissions", protect, updateAdminPermissions);

module.exports = router;
