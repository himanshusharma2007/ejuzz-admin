const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Customer Schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ""
  },
  email: {
    type: String,
    unique: true,
    sparse: true,  // This allows multiple null values
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Email is invalid']
  },
  password: {
    type: String,
    select: false,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  profile:{
    url: {type : String, require: true},
    publicId: {type : String, require: true},
  },
  govId:{
    url: {type : String, require: true},
    publicId: {type : String, require: true},
  },
  paymentId: {
    type: String,
    trime: true,
    default: null,
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
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true }
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

// Hash the password before saving
customerSchema.pre('save', async function (next) {
  // Only hash the password if it was modified or is a new document
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Instance method to check if password is correct
customerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
