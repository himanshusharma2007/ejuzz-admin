const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  orderHistory: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  wishlist: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }],
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  accountStatus: {
    isActive: {
      type: Boolean,
      default: true
    },
    deactivatedAt: Date,
    reasonForDeactivation: String
  }
}, {
  timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
