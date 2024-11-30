// controllers/productManagementController.js
const Product = require('../models/productModel');

// @desc    Get all products by merchant ID with pagination
// @route   GET /api/admin/products
// @access  Private (Admin only)
exports.getAllProducts = async (req, res) => {
  console.log('Executing getAllProducts controller');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const shopId = req.params.shopId;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Merchant ID is required'
      });
    }

    const products = await Product.find({ shopId })
    .populate({
      path: 'shopId',
      populate: {
        path: 'merchantId',
        select: 'name email', // Only include these fields from merchantId
      },
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(products);

   
    
    res.status(200).json({
      success: true,
      data: {
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts
      }
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching merchant products',
      error: error.message
    });
  }
};

// @desc    Get product details by ID
// @route   GET /api/admin/products/:id
// @access  Private (Admin only)
exports.getProductById = async (req, res) => {
  console.log('Executing getProductById controller');
  try {
    const product = await Product.findById(req.params.id)
      .populate('merchantId', 'name email')
      .populate('ratings.customerId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('Product details retrieved successfully');
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
      error: error.message
    });
  }
};
exports.getAllShopProduct = async (req, res) => {
  console.log('Executing getProductById controller');
  try {
    const product = await Product.findById({shopId:req.params.shopId})
      .populate('merchantId', 'name email')
      .populate('ratings.customerId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('Product details retrieved successfully');
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
      error: error.message
    });
  }
};
exports.removeProduct = async (req, res) => {
  console.log('Executing removeProduct controller');
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    console.log('Product removed successfully');

    res.status(200).json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (error) {
    console.error('Error in removeProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing product',
      error: error.message
    });
  }
};

