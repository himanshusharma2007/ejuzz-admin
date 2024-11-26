const Admin = require("../models/adminModel");

exports.signup = async (req, res) => {
  try {
    console.log("Starting admin signup process...", req.body);
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Signup failed: Email already exists");
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "Moderator",
      permissions:
        role === "Super Admin"
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

    console.log("Admin created successfully");
    sendTokenResponse(admin, 201, res);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating admin account",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Starting admin login process...");

    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      console.log("Login failed: Missing credentials");
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for admin
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      console.log("Login failed: Admin not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log("Login failed: Invalid password");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    console.log("Admin logged in successfully");
    sendTokenResponse(admin, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    console.log("Processing admin logout...");

    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    console.log("Admin logged out successfully");
    res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

exports.getAdmin = (req, res) => {
  try {
    console.log('req.amdin in getAdmin', req.amdin)
    const admin = req.admin;
    if (!admin) {
      res.status(500).json({
        success: false,
        message: "Error getting admin",
        error: error.message,
      });
    } else {
      res.status(200).json({ admin });
    }
  } catch (error) {
    console.error("get admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting admin",
      error: error.message,
    });
  }
};
const sendTokenResponse = (admin, statusCode, res) => {
  const token = admin.generateAuthToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
