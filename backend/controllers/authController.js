const Admin = require("../models/adminModel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.initiateResetPassword = async (req, res) => {
  try {
    const { email, loginId } = req.body;

    // Find admin by email and loginId
    const admin = await Admin.findOne({ email, loginId });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Generate OTP
    const otp = admin.generateResetPasswordOTP();
    await admin.save();

    // Prepare email content
    const emailSubject = "Password Reset OTP";
    const emailMessage = `
      <p>Your password reset OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 15 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;

    // Send OTP via email
    const emailSent = await sendEmail(email, emailSubject, emailMessage);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email"
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });
  } catch (error) {
    console.error("Reset password initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Error initiating password reset",
      error: error.message
    });
  }
};

exports.verifyResetPasswordOTP = async (req, res) => {
  try {
    const { email, loginId, otp } = req.body;

    // Find admin by email and loginId
    const admin = await Admin.findOne({ email, loginId }).select('+resetPasswordOTP +resetPasswordOTPExpires');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Verify OTP
    if (!admin.verifyResetPasswordOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Clear OTP after successful verification
    admin.resetPasswordOTP = undefined;
    admin.resetPasswordOTPExpires = undefined;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password."
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, loginId, newPassword } = req.body;

    // Find admin by email and loginId
    const admin = await Admin.findOne({ email, loginId });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Validate password strength
    if (!admin.validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements. Must be at least 12 characters with uppercase, lowercase, number, and special character."
      });
    }

    // Set new password
    admin.password = newPassword;
    await admin.save();

    // Prepare notification email
    const emailSubject = "Password Successfully Reset";
    const emailMessage = `
      <p>Your account password has been successfully reset.</p>
      <p>If you did not make this change, please contact support immediately.</p>
    `;

    // Send confirmation email
    await sendEmail(email, emailSubject, emailMessage);

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message
    });
  }
};


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

exports.signup = async (req, res) => {
  try {
    console.log("Starting admin signup process...", req.body);
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

    console.log("Admin created successfully");
    sendTokenResponse(admin, 201, res, { loginId, password });
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

    const { loginId, password } = req.body;

    // Validate login ID & password
    if (!loginId || !password) {
      console.log("Login failed: Missing credentials");
      return res.status(400).json({
        success: false,
        message: "Please provide login ID and password",
      });
    }

    // Check for admin
    const admin = await Admin.findOne({ loginId }).select("+password");
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
    console.log('req.admin in getAdmin', req.admin)
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
const sendTokenResponse = (admin, statusCode, res, credentials = {}) => {
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

  const responseData = {
    success: true,
    token,
    ...credentials, // This will include loginId and password during signup
  };

  res.status(statusCode).cookie("token", token, options).json(responseData);
};

module.exports = exports;