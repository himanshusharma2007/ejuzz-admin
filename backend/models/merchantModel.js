
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const merchantSchema = new mongoose.Schema({
    storeName: {
      type: String,
      required: true,
      unique: true
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
    isVerified: {
      type: Boolean,
      default: false
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    payoutBalance: {
      type: Number,
      default: 0
    },
    bankAccountDetails: {
      accountNumber: String,
      bankName: String,
      branch: String,
      IFSCCode: String
    },
    ratings: [{
      rating: Number,
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
      },
      comment: String,
      date: Date
    }],
    commission: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      },
      value: {
        type: Number,
        default: 10
      }
    }
  }, {
    timestamps: true
  });
  
  const Merchant = mongoose.model('Merchant', merchantSchema);
  module.exports = Merchant;
