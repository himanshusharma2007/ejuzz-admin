const Merchant = require('../models/merchantModel');
const Admin = require('../models/adminModel');

// Get all merchants with pagination and filters
exports.getAllMerchants = async (req, res) => {
  try {
    console.log('Fetching merchants with filters:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.isVerified) {
      filter.isVerified = req.query.isVerified === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { storeName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const merchants = await Merchant.find(filter)
      .select('-password')
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
        totalMerchants: total
      }
    });
  } catch (error) {
    console.error('Error in getAllMerchants:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching merchants'
    });
  }
};

// Get single merchant details
exports.getMerchantDetails = async (req, res) => {
  try {
    console.log('Fetching merchant details for ID:', req.params.id);

    const merchant = await Merchant.findById(req.params.id)
      .select('-password')
      .populate('products');

    if (!merchant) {
      console.log('Merchant not found');
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    console.log('Merchant details fetched successfully');
    res.status(200).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    console.error('Error in getMerchantDetails:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching merchant details'
    });
  }
};

// Handle merchant verification
exports.handleMerchantVerification = async (req, res) => {
  try {
    console.log('Processing merchant verification:', {
      merchantId: req.params.id,
      status: req.body.status,
      adminId: req.admin.id
    });

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      console.log('Merchant not found');
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Update merchant verification status
    merchant.isVerified = status === 'approved';
    await merchant.save();

    // Add verification request to admin's log
    await Admin.findByIdAndUpdate(req.admin.id, {
      $push: {
        verificationRequests: {
          merchantId: merchant._id,
          status: status,
          updatedAt: new Date()
        }
      }
    });

    console.log(`Merchant verification ${status} successfully`);
    res.status(200).json({
      success: true,
      message: `Merchant ${status} successfully`,
      data: merchant
    });
  } catch (error) {
    console.error('Error in handleMerchantVerification:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing merchant verification'
    });
  }
};

// Update merchant status (suspend/activate)
exports.updateMerchantStatus = async (req, res) => {
  try {
    console.log('Updating merchant status:', {
      merchantId: req.params.id,
      active: req.body.active
    });

    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.active },
      { new: true, runValidators: true }
    ).select('-password');

    if (!merchant) {
      console.log('Merchant not found');
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    console.log('Merchant status updated successfully');
    res.status(200).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    console.error('Error in updateMerchantStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating merchant status'
    });
  }
};

// Get pending verification requests
exports.getPendingVerifications = async (req, res) => {
  try {
    console.log('Fetching pending verification requests');

    const merchants = await Merchant.find({
      isVerified: false
    }).select('-password');

    console.log(`Found ${merchants.length} pending verification requests`);
    res.status(200).json({
      success: true,
      data: merchants
    });
  } catch (error) {
    console.error('Error in getPendingVerifications:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching pending verifications'
    });
  }
};

// middleware/merchantManagementAuth.js
exports.checkMerchantManagementPermission = async (req, res, next) => {
  try {
    console.log('Checking merchant management permission for admin:', req.admin.id);

    const admin = await Admin.findById(req.admin.id);
    if (!admin.permissions.includes('manage_merchants')) {
      console.log('Permission denied: manage_merchants permission required');
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to manage merchants'
      });
    }

    console.log('Merchant management permission verified');
    next();
  } catch (error) {
    console.error('Error in checkMerchantManagementPermission:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking permissions'
    });
  }
};