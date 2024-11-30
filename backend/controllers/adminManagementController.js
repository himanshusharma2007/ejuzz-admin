const Admin = require("../models/adminModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const getAllAdmins = async (req, res) => {
  try {
    console.log("Getting all admin accounts...");

    const admins = await Admin.find({})
      .select("-password -verificationRequests -systemReports -transactionsLog")
      .sort("-createdAt");

    console.log(`Successfully retrieved ${admins.length} admin accounts`);

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error("Error in getAllAdmins:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin accounts",
      error: error.message,
    });
  }
};

// @desc    Get single admin
// @route   GET /api/v1/admins/:id
// @access  Private/Super Admin
const getSingleAdmin = async (req, res) => {
  try {
    console.log(`Getting admin with ID: ${req.params.id}`);

    const admin = await Admin.findById(req.params.id).select(
      "-password -verificationRequests -systemReports -transactionsLog"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: `No admin found with ID: ${req.params.id}`,
      });
    }

    console.log("Successfully retrieved admin details");

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Error in getSingleAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin details",
      error: error.message,
    });
  }
};

// @desc    Create admin
// @route   POST /api/v1/admins
// @access  Private/Super Admin
// @desc    Create admin
// @route   POST /api/v1/admins
// @access  Private/Super Admin
const createAdmin = async (req, res) => {
  try {
    console.log("Starting add new admin process...");

    // Check if requester is Super Admin
    if (req.admin.role !== "Super Admin") {
      console.log("Add admin failed: Insufficient permissions");
      return res.status(403).json({
        success: false,
        message: "Not authorized to add new admins",
      });
    }

    // Destructure name from request body
    const { name, email } = req.body;

    // Split name into first and last name
    const [firstName, lastName] = name.split(' ');

    // Generate unique login ID
    let loginId = generateLoginId(firstName);

    // Ensure login ID is unique
    let existingLoginId = await Admin.findOne({ loginId });
    while (existingLoginId) {
      loginId = generateLoginId(firstName);
      existingLoginId = await Admin.findOne({ loginId });
    }

    // Generate random password
    const password = generateRandomPassword();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Add admin failed: Email already exists");
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      loginId,
      password,
      role: req.body.role || "Moderator",
      permissions:
        req.body.role === "Super Admin"
          ? [
              "manage_admins",
              "manage_merchants",
              "manage_customers",
              "manage_products",
              "manage_orders",
              "manage_transactions",
              "manage_reports",
            ]
          : ["manage_merchants", "manage_customers", "manage_products"],
    });

    // Prepare email content
    const emailSubject = "Your Admin Account Credentials";
    const emailMessage = `
      <html>
        <body>
          <h2>Welcome to the Admin Portal</h2>
          <p>An admin account has been created for you.</p>
          <p><strong>Login ID:</strong> ${loginId}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
          <p>Please log in and change your password immediately.</p>
        </body>
      </html>
    `;

    // Send email with login credentials
    const emailSent = await sendEmail(email, emailSubject, emailMessage);

    if (!emailSent) {
      console.log("Failed to send email to admin");
      // You might want to handle this case, perhaps by adding a flag to the admin record
    }

    console.log("Admin created successfully");
    res.status(201).json({
      success: true,
      data: { 
        name: admin.name, 
        email: admin.email, 
        loginId: admin.loginId, 
        role: admin.role 
      },
      message: "Admin account created successfully"
    });
  } catch (error) {
    console.error("Add admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding new admin",
      error: error.message,
    });
  }
};

// Helper functions (to be added at the top of the file)


// Function to generate a unique login ID
const generateLoginId = (firstName) => {
  // Remove any non-alphanumeric characters and convert to lowercase
  const cleanFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Add a random 3-digit number to ensure uniqueness
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  
  return `${cleanFirstName}${randomSuffix}`;
};

// Function to generate a random 8-digit password
const generateRandomPassword = () => {
  return crypto.randomBytes(4).toString('hex');
};



// @desc    Update admin
// @route   PATCH /api/v1/admins/:id
// @access  Private/Super Admin
const updateAdmin = async (req, res) => {
  try {
    console.log(`Updating admin with ID: ${req.params.id}`);

    const { password, role, ...updateData } = req.body;

    // Handle role updates
    if (role && req.admin.role !== "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can update admin roles",
      });
    }

    // Add role to update if Super Admin
    if (role && req.admin.role === "Super Admin") {
      updateData.role = role;
    }

    const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select(
      "-password -verificationRequests -systemReports -transactionsLog"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: `No admin found with ID: ${req.params.id}`,
      });
    }

    console.log(`Successfully updated admin: ${admin.email}`);

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Error in updateAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin account",
      error: error.message,
    });
  }
};

// @desc    Delete admin
// @route   DELETE /api/v1/admins/:id
// @access  Private/Super Admin
const deleteAdmin = async (req, res) => {
  try {
    console.log(`Deleting admin with ID: ${req.params.id}`);

    const adminToDelete = await Admin.findById(req.params.id);

    if (!adminToDelete) {
      return res.status(404).json({
        success: false,
        message: `No admin found with ID: ${req.params.id}`,
      });
    }

    // Prevent deletion of Super Admin by non-Super Admin
    if (
      adminToDelete.role === "Super Admin" &&
      req.admin.role !== "Super Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can delete Super Admin accounts",
      });
    }

    await Admin.findByIdAndDelete(req.params.id);

    console.log(`Successfully deleted admin: ${adminToDelete.email}`);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete admin account",
      error: error.message,
    });
  }
};

// @desc    Update admin permissions
// @route   PATCH /api/v1/admins/:id/permissions
// @access  Private/Super Admin
const updateAdminPermissions = async (req, res) => {
  try {
    console.log(`Updating permissions for admin ID: ${req.params.id}`);

    if (req.admin.role !== "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admins can modify admin permissions",
      });
    }

    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid permissions array",
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { permissions },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -verificationRequests -systemReports -transactionsLog");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: `No admin found with ID: ${req.params.id}`,
      });
    }

    console.log(`Successfully updated permissions for admin: ${admin.email}`);

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Error in updateAdminPermissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin permissions",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAdmins,
  getSingleAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminPermissions,
};
