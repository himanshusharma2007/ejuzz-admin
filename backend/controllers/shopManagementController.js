// controllers/shopManagementController.js
const Shop = require('../models/shopModel');
const Product = require('../models/productModel');

// @desc    Get all shops with pagination and filters
// @route   GET /api/admin/shops
// @access  Private (Admin only)
exports.getAllShops = async (req, res) => {
  console.log('Executing getAllShops controller');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object based on query parameters
    const filter = {};
    if (req.query.city) filter['address.city'] = req.query.city;
    if (req.query.minRating) filter.rating = { $gte: parseFloat(req.query.minRating) };

    // Execute query with filters and pagination
    const shops = await Shop.find(filter)
      .populate('merchantId', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const totalShops = await Shop.countDocuments(filter);

    console.log(`Retrieved ${shops.length} shops`);

    res.status(200).json({
      success: true,
      data: {
        shops,
        currentPage: page,
        totalPages: Math.ceil(totalShops / limit),
        totalShops
      }
    });
  } catch (error) {
    console.error('Error in getAllShops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message
    });
  }
};

// @desc    Get shop details by ID with active products
// @route   GET /api/admin/shops/:id
// @access  Private (Admin only)
exports.getShopById = async (req, res) => {
  console.log('Executing getShopById controller');
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('merchantId', 'name email')

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Get active products count and recent products
    const productsCount = await Product.countDocuments({ merchantId: shop.merchantId });
    const recentProducts = await Product.find({ merchantId: shop.merchantId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price stock salesCount');

    console.log('Shop details retrieved successfully');
    res.status(200).json({
      success: true,
      data: {
        shop,
        statistics: {
          totalProducts: productsCount,
          recentProducts
        }
      }
    });
  } catch (error) {
    console.error('Error in getShopById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop details',
      error: error.message
    });
  }
};

// @desc    Get shop performance metrics
// @route   GET /api/admin/shops/:id/performance
// @access  Private (Admin only)
exports.getShopPerformance = async (req, res) => {
  console.log('Executing getShopPerformance controller');
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Aggregate products data for the shop
    const productStats = await Product.aggregate([
      { $match: { merchantId: shop.merchantId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalSales: { $sum: '$salesCount' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Calculate average rating
    const averageRating = shop.reviews.length > 0
      ? shop.reviews.reduce((acc, review) => acc + review.rating, 0) / shop.reviews.length
      : 0;

    console.log('Shop performance metrics retrieved successfully');
    res.status(200).json({
      success: true,
      data: {
        shopId: shop._id,
        merchantId: shop.merchantId,
        statistics: productStats[0] || {
          totalProducts: 0,
          averagePrice: 0,
          totalSales: 0,
          outOfStock: 0
        },
        ratings: {
          average: averageRating,
          total: shop.reviews.length
        }
      }
    });
  } catch (error) {
    console.error('Error in getShopPerformance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop performance metrics',
      error: error.message
    });
  }
};