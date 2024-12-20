const Customer = require('../models/customerModel');
const Order = require('../models/orderModel');
const Admin = require('../models/adminModel');
const WalletTransaction = require('../models/walletTransactionModel');

// Get all customers with pagination and filters
exports.getAllCustomers = async (req, res) => {
  try {
    console.log('Fetching customers with filters:', req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Build filter object based on query parameters
    const filter = {};
    if (req.query.isVerified) {
      filter.isVerified = req.query.isVerified === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phoneNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(filter);

    console.log(`Found ${customers.length} customers out of ${total} total`);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCustomers: total
      }
    });
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching customers'
    });
  }
};

// Get single customer details with transaction history
exports.getCustomerDetails = async (req, res) => {
  try {

    const customer = await Customer.findById(req.params.id).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Fetch customer's order history
    const orders = await Order.find({ customerId: req.params.id })
      .populate('products.productId')
      .populate('merchantId', 'name email');


    res.status(200).json({
      success: true,
      data: {
        customer,
        orders
      }
    });
  } catch (error) {
    console.error('Error in getCustomerDetails:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching customer details'
    });
  }
};

// Update customer status (suspend/activate account)
exports.updateCustomerStatus = async (req, res) => {
  try {
    console.log('Updating customer status:', {
      customerId: req.params.id,
      active: req.body.active
    });

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          accountStatus: {
            isActive: req.body.active,
            deactivatedAt: Date.now(),
            reasonForDeactivation: req.body.reason || 'Status update by admin'
          }
        }
      },
      { new: true }
    ).select('-password');

    if (!customer) {
      console.log('Customer not found');
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    console.log(customer)

    // Log the action in admin's activity
    await Admin.findByIdAndUpdate(req.admin._id, {
      $push: {
        notifications: {
          message: `Customer ${customer.name} (${customer.email}) ${req.body.active ? 'activated' : 'suspended'}`,
          date: new Date()
        }
      }
    });

    console.log('Customer status updated successfully');
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error in updateCustomerStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating customer status'
    });
  }
};

exports.verifyCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      console.log('Customer not found');
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Log the action in admin's activity
    await Admin.findByIdAndUpdate(req.admin._id, {
      $push: {
        notifications: {
          message: `Customer ${customer.name} (${customer.email}) verify'}`,
          date: new Date()
        }
      }
    });

    console.log('Customer verification successfully');
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error in updateCustomerStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating customer status'
    });
  }
};

// Get customer wallet transactions
exports.getCustomerTransactions = async (req, res) => {
  try {
    console.log('Fetching wallet transactions for customer:', req.params.id);

    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    const filter = {};

    if (customer._id) {
      filter.$or = [
        { from: customer._id },
        { to: customer._id},
      ];
    }

    const transactions = await WalletTransaction.find(filter)
      .populate("from", "name email paymentId")
      .populate("to", "name email paymentId")
      .sort({ createdAt: -1 }); // Sort by latest transactions


    res.status(200).json({
      success: true,
      data: {
        transactions
      }
    });
  } catch (error) {
    console.error('Error in getCustomerTransactions:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching customer transactions'
    });
  }
};

// Update customer wallet balance
exports.updateWalletBalance = async (req, res) => {
  try {
    console.log('Updating wallet balance for customer:', {
      customerId: req.params.id,
      adjustment: req.body.adjustment
    });

    const { adjustment, reason } = req.body;
    if (!adjustment || isNaN(adjustment)) {
      return res.status(400).json({
        success: false,
        error: 'Valid adjustment amount is required'
      });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Update wallet balance
    const newBalance = customer.walletBalance + parseFloat(adjustment);
    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient wallet balance for deduction'
      });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        walletBalance: newBalance,
        $push: {
          walletHistory: {
            amount: adjustment,
            type: adjustment > 0 ? 'credit' : 'debit',
            reason: reason || 'Manual adjustment by admin',
            updatedBy: req.admin._id
          }
        }
      },
      { new: true }
    ).select('-password');

    console.log('Wallet balance updated successfully');
    res.status(200).json({
      success: true,
      data: updatedCustomer
    });
  } catch (error) {
    console.error('Error in updateWalletBalance:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating wallet balance'
    });
  }
};

// Middleware to check customer management permissions
exports.checkCustomerManagementPermission = async (req, res, next) => {
  try {

    const admin = await Admin.findById(req.admin._id);
    if (!admin.permissions.includes('manage_customers')) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to manage customers'
      });
    }
    next();
  } catch (error) {
    console.error('Error in checkCustomerManagementPermission:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking permissions'
    });
  }
};