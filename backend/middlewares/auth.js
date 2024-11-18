const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

exports.protect = async (req, res, next) => {
  try {
    console.log('Verifying admin authentication...');
    
    let token;

    if (req.cookies.token) {
        console.log("req.cookies.token",req.cookies)
      token = req.cookies.token;
    }

    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('Authentication failed: Admin not found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    req.admin = admin;
    console.log('Authentication successful');
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: error.message
    });
  }
};