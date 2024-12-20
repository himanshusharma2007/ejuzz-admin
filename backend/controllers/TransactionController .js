const WalletTransaction = require('../models/walletTransactionModel');
const Customer = require('../models/customerModel');
const Merchant = require('../models/merchantModel');
const Admin = require('../models/adminModel');

// Get all transactions with filtering and pagination
exports.getAllTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            transactionType,
            dateRange,
            search,
            userType
        } = req.query;

        // Build query
        const query = {};

        // Add transaction type filter
        if (transactionType && transactionType !== 'ALL') {
            query.transactionType = transactionType;
        }

        // Add date range filter
        if (dateRange && dateRange !== 'ALL') {
            const now = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'TODAY':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'WEEK':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'MONTH':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
            }

            query.createdAt = { $gte: startDate, $lte: now };
        }

        // Add user type filter
        if (userType) {
            if (userType === 'customer') {
                query.$or = [
                    { fromModel: 'Customer' },
                    { toModel: 'Customer' }
                ];
            } else if (userType === 'merchant') {
                query.$or = [
                    { fromModel: 'Merchant' },
                    { toModel: 'Merchant' }
                ];
            }
        }

        // Add search functionality
        if (search) {
            const searchRegex = new RegExp(search, 'i');

            // Get user IDs matching the search term
            const customers = await Customer.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phoneNumber: searchRegex }
                ]
            }).select('_id');

            const merchants = await Merchant.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phoneNo: searchRegex }
                ]
            }).select('_id');

            const userIds = [
                ...customers.map(c => c._id),
                ...merchants.map(m => m._id)
            ];

            query.$or = [
                { from: { $in: userIds } },
                { to: { $in: userIds } },
                { amount: isNaN(search) ? undefined : Number(search) }
            ].filter(Boolean);
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const transactions = await WalletTransaction.find(query)
            .skip(skip)
            .limit(Number(limit))
            .populate('from', 'name email phoneNumber phoneNo')
            .populate('to', 'name email phoneNumber phoneNo')
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const total = await WalletTransaction.countDocuments(query);

        res.status(200).json({
            status: 'success',
            data: {
                transactions,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

// Get transactions for a specific user
exports.getUserTransactions = async (req, res) => {
    try {
        const { userId, userType } = req.params;
        const { page = 1, limit = 10, dateRange } = req.query;

        // Validate user exists
        const UserModel = userType === 'customer' ? Customer : Merchant;
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Build query
        const query = {
            $or: [
                { from: userId, fromModel: userType === 'customer' ? 'Customer' : 'Merchant' },
                { to: userId, toModel: userType === 'customer' ? 'Customer' : 'Merchant' }
            ]
        };

        // Add date range filter
        if (dateRange && dateRange !== 'ALL') {
            const now = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'TODAY':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'WEEK':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'MONTH':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
            }

            query.createdAt = { $gte: startDate, $lte: now };
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const transactions = await WalletTransaction.find(query)
            .skip(skip)
            .limit(Number(limit))
            .populate('from', 'name email phoneNumber phoneNo')
            .populate('to', 'name email phoneNumber phoneNo')
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const total = await WalletTransaction.countDocuments(query);

        // Get user's current wallet balance
        const walletBalance = userType === 'customer' ? user.walletBalance : user.payoutBalance;

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: userType === 'customer' ? user.phoneNumber : user.phoneNo,
                    walletBalance
                },
                transactions,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        const stats = await WalletTransaction.aggregate([
            {
                $facet: {
                    totalTransactions: [
                        { $count: 'count' }
                    ],
                    transactionsByType: [
                        {
                            $group: {
                                _id: '$transactionType',
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' }
                            }
                        }
                    ],
                    dailyTransactions: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                }
                            }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$amount' }
                            }
                        },
                        { $sort: { '_id': 1 } }
                    ]
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: stats[0]
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

// Export transactions
exports.exportTransactions = async (req, res) => {
    try {
        const { startDate, endDate, userType, transactionType, userId } = req.query;

        // Build query based on filters
        const query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (userId) {
            query.$or = [
                { from: userId },
                { to: userId },
            ];
        }

        if (transactionType && transactionType !== 'ALL') {
            query.transactionType = transactionType;
        }

        if (userType) {
            if (userType === 'customer') {
                query.$or = [
                    { fromModel: 'Customer' },
                    { toModel: 'Customer' }
                ];
            } else if (userType === 'merchant') {
                query.$or = [
                    { fromModel: 'Merchant' },
                    { toModel: 'Merchant' }
                ];
            }
        }

        const transactions = await WalletTransaction.find(query)
            .populate('from', 'name email phoneNumber phoneNo')
            .populate('to', 'name email phoneNumber phoneNo')
            .sort({ createdAt: -1 });

        // Transform data for CSV
        const csvData = transactions.map(transaction => ({
            TransactionID: transaction._id,
            Type: transaction.transactionType,
            Amount: transaction.amount,
            FromName: transaction.from?.name || 'N/A',
            FromType: transaction.fromModel,
            ToName: transaction.to?.name || 'N/A',
            ToType: transaction.toModel,
            Date: transaction.createdAt
        }));

        res.status(200).json({
            status: 'success',
            data: csvData
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

// Middleware to check customer management permissions
exports.checkTransactionsManagementPermission = async (req, res, next) => {
    try {
  
      const admin = await Admin.findById(req.admin._id);
      if (!admin.permissions.includes('manage_transactions')) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to manage transactions'
        });
      }
      next();
    } catch (error) {
      console.error('Error in checkTransactionsManagementPermission:', error);
      res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };