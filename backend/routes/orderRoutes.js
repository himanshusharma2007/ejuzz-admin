const express = require('express');
const orderController = require('../controllers/orderController');
const {protect} = require('../middlewares/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(orderController.getAllOrders);

router
  .route('/:id')
  .get(orderController.getOrderById)
  .patch(orderController.updateOrderStatus);

module.exports = router; 