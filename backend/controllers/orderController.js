const Order = require("../models/orderModel");

// Get all orders with pagination
exports.getAllOrders = async (req, res) => {
  console.log('Starting getAllOrders execution');
  try {
    // Parse query parameters with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    console.log(`Pagination params - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);


    // Execute query with pagination
    const orders = await Order.find({})
      .populate('customerId', 'name email phoneNo')
      .populate('merchantId', 'name email')
      .populate('products.productId', 'name price')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${orders.length} orders`);

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(orders);
    const totalPages = Math.ceil(totalOrders / limit);

    console.log(`Total orders: ${totalOrders}, Total pages: ${totalPages}`);

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  console.log(`Starting getOrderById execution for ID: ${req.params.id}`);
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phoneNo')
      .populate('merchantId', 'name email')
      .populate('products.productId', 'name price');

    if (!order) {
      console.log(`No order found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    console.log('Order found successfully');
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  console.log(`Starting updateOrderStatus execution for ID: ${req.params.id}`);
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Preparing', 'Picked Up', 'Complete', 'Reject'];

    if (!validStatuses.includes(status)) {
      console.log(`Invalid status provided: ${status}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status provided'
      });
    }

    console.log(`Updating order status to: ${status}`);
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      console.log(`No order found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    console.log('Order status updated successfully');
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating order status',
      error: error.message
    });
  }
}; 