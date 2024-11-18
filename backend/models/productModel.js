const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const productSchema = new mongoose.Schema({
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    tags: [String],
    stock: {
      type: Number,
      default: 0
    },
    images: [{
      url: String,
      altText: String
    }],
    specifications: {
      weight: String,
      dimensions: String,
      material: String,
      color: String,
      brand: String
    },
    ratings: [{
      rating: Number,
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
      },
      review: String,
      createdAt: Date
    }],
    salesCount: {
      type: Number,
      default: 0
    }
  }, {
    timestamps: true
  });
  
  const Product = mongoose.model('Product', productSchema);
  module.exports = Product;
