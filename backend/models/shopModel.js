const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const shopSchema = new mongoose.Schema({
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    },
    contact: {
      phoneNumber: String,
      email: String
    },
    establishedDate: Date,
    rating: {
      type: Number,
      default: 0
    },
    reviews: [{
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
      },
      rating: Number,
      comment: String,
      createdAt: Date
    }]
  }, {
    timestamps: true
  });
  
  const Shop = mongoose.model('Shop', shopSchema);
  module.exports = Shop;
