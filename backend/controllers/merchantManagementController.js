const Merchant = require("../models/merchantModel");
const Admin = require("../models/adminModel");
const sendEmail = require("../utils/sendEmail");
const hashPassword = require("../utils/password");
const Shop = require("../models/shopModel");
// Get all merchants with pagination and filters
exports.getAllMerchants = async (req, res) => {
  try {
    console.log("Fetching merchants with filters:", req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isVerified) {
      filter.isVerified = req.query.isVerified === "true";
    }
    if (req.query.search) {
      filter.$or = [
        { storeName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const merchants = await Merchant.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Merchant.countDocuments(filter);

    console.log(`Found ${merchants.length} merchants out of ${total} total`);

    res.status(200).json({
      success: true,
      data: merchants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMerchants: total,
      },
    });
  } catch (error) {
    console.error("Error in getAllMerchants:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching merchants",
    });
  }
};

// Get single merchant details
exports.getMerchantDetails = async (req, res) => {
  try {
    console.log("Fetching merchant details for ID:", req.params.id);

    const merchant = await Merchant.findById(req.params.id)
      .select("-password")
      .populate("products");

    if (!merchant) {
      console.log("Merchant not found");
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      });
    }

    console.log("Merchant details fetched successfully");
    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    console.error("Error in getMerchantDetails:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching merchant details",
    });
  }
};

// Helper function to generate unique login ID from business name
const generateLoginId = async (businessName) => {
  // Remove special characters and spaces, convert to lowercase
  let baseId = businessName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12);

  // Add random numbers to ensure uniqueness
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  let loginId = `${baseId}${randomNum}`;

  // Check if ID already exists, if so, generate a new one
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const existingMerchant = await Merchant.findOne({ loginId });
    if (!existingMerchant) {
      isUnique = true;
    } else {
      const newRandomNum = Math.floor(1000 + Math.random() * 9000);
      loginId = `${baseId}${newRandomNum}`;
      attempts++;
    }
  }

  return loginId;
};

// Helper function to generate random password
const generatePassword = () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";

  // Ensure at least one number and one uppercase letter
  password += charset.match(/[A-Z]/)[0];
  password += charset.match(/[0-9]/)[0];

  // Generate remaining 6 characters
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Enhanced handleMerchantVerification function
exports.handleMerchantVerification = async (req, res) => {
  try {
    console.log("Processing merchant verification:", {
      merchantId: req.params.id,
      status: req.body.status,
      adminId: req.admin.id,
    });

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      console.log("Merchant not found");
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      });
    }

    merchant.isVerify = status === "approved";

    if (status === "approved") {
      // Generate login credentials
      const merchantShop = await Shop.findOne({ merchantId: merchant._id });
      console.log('merchantShop', merchantShop)
      const loginId = await generateLoginId(merchantShop?.name);
      const password = generatePassword();

      // Update merchant with credentials
      merchant.loginId = loginId;
      merchant.password = await hashPassword(password); // Note: This should be hashed before saving in production

      // Send email with credentials
      const emailSubject = "Your Merchant Account Has Been Approved";
      const emailMessage = `
        <h1>Congratulations! Your merchant account has been approved.</h1>
        <p>Here are your login credentials:</p>
        <p><strong>Login ID:</strong> ${loginId}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please change your password after your first login for security purposes.</p>
        <p>Thank you for joining our platform!</p>
      `;

      const emailSent = await sendEmail(
        merchant.email,
        emailSubject,
        emailMessage
      );
      if (!emailSent) {
        console.log("Failed to send email notification");
      }
    }

    await merchant.save();

    // Add verification request to admin's log
    await Admin.findByIdAndUpdate(req.admin.id, {
      $push: {
        verificationRequests: {
          merchantId: merchant._id,
          status: status,
          updatedAt: new Date(),
        },
      },
    });

    console.log(`Merchant verification ${status} successfully`);
    res.status(200).json({
      success: true,
      message: `Merchant ${status} successfully`,
      data: merchant,
    });
  } catch (error) {
    console.error("Error in handleMerchantVerification:", error);
    res.status(500).json({
      success: false,
      error: "Error processing merchant verification",
    });
  }
};
// Update merchant status (suspend/activate)
exports.updateMerchantStatus = async (req, res) => {
  try {
    console.log("Updating merchant status:", {
      merchantId: req.params.id,
      active: req.body.active,
    });

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.active },
      { new: true, runValidators: true }
    ).select("-password");

    if (!merchant) {
      console.log("Merchant not found");
      return res.status(404).json({
        success: false,
        error: "Merchant not found",
      });
    }

    console.log("Merchant status updated successfully");
    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    console.error("Error in updateMerchantStatus:", error);
    res.status(500).json({
      success: false,
      error: "Error updating merchant status",
    });
  }
};

// Get pending verification requests
exports.getPendingVerifications = async (req, res) => {
  try {
    console.log("Fetching pending verification requests");

    const merchants = await Merchant.find({ isVerify: false }).select(
      "-password"
    );

    console.log(`Found ${merchants.length} pending verification requests`);
    res.status(200).json({
      success: true,
      data: merchants,
    });
  } catch (error) {
    console.error("Error in getPendingVerifications:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching pending verifications",
    });
  }
};

// middleware/merchantManagementAuth.js
exports.checkMerchantManagementPermission = async (req, res, next) => {
  try {
    console.log(
      "Checking merchant management permission for admin:",
      req.admin.id
    );

    const admin = await Admin.findById(req.admin.id);
    if (!admin.permissions.includes("manage_merchants")) {
      console.log("Permission denied: manage_merchants permission required");
      return res.status(403).json({
        success: false,
        error: "You do not have permission to manage merchants",
      });
    }

    console.log("Merchant management permission verified");
    next();
  } catch (error) {
    console.error("Error in checkMerchantManagementPermission:", error);
    res.status(500).json({
      success: false,
      error: "Error checking permissions",
    });
  }
};
