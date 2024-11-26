const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'Merchant ID is required.'],
    },
    name: {
      type: String,
      required: [true, 'Business name is required.'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters.'],
    },
    businessCategory: {
      type: String,
      required: [true, 'Business category is required.'],
    },
    businessRegistrationNumber: {
      type: String,
      required: [true, 'Business registration number is required.'],
      unique: [true, "Business registration number is mast be unique."],
      trim: true,
      minlength: [6, 'Business registration number must be at least 6 characters.'],
      maxlength: [20, 'Business registration number cannot exceed 20 characters.'],
    },
    socialMediaLink: {
      type: String,
      match: [/^https?:\/\/.+/, 'Invalid social media link.'],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters.'],
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required.'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required.'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required.'],
        match: [/^\d{4,10}$/, 'Invalid postal code.'],
      },
      country: {
        type: String,
        required: [true, 'Country is required.'],
        trim: true,
      },
    },
    contact: {
      phoneNo: {
        type: String,
        required: [true, 'Phone number is required.'],
        match: [/^\d{10,15}$/, 'Invalid phone number format.'],
      },
      email: {
        type: String,
        required: [true, 'Contact email is required.'],
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format.'],
      },
    },
    establishedDate: {
      type: Date,
      required: [true, 'Established date is required.'],
      validate: {
        validator: (value) => value <= new Date(),
        message: 'Established date cannot be in the future.',
      },
    },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          required: [true, 'Customer ID is required for a rating.'],
        },
        rating: {
          type: Number,
          required: [true, 'Rating value is required.'],
          min: [1, 'Rating must be at least 1.'],
          max: [5, 'Rating cannot exceed 5.'],
        },
        comment: {
          type: String,
          trim: true,
          maxlength: [300, 'Comment cannot exceed 300 characters.'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;
