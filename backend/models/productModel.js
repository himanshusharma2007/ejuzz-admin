const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop ID is required.'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required.'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters.'],
  },
  description: {
    type: String,
    required: [true, 'Description is required.'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Product price is required.'],
    min: [0, 'Product price cannot be negative.'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required.'],
  },
  tags: {
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v);
      },
      message: 'Tags must be an array.',
    },
  },
  status:{
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative.'],
  },
  images: [
    {
      url: {
        type: String,
        required: [true, 'Image URL is required.'],
      },
      public_id: {
        type: String,
        required: [true, 'Public ID is required for images.'],
      },
    },
  ],
  specifications: {
    weight: String,
    dimensions: String,
    material: String,
    color: String,
    brand: String,
  },
  ratings: [
    {
      rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1.'],
        max: [5, 'Rating cannot exceed 5.'],
      },
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
      review: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  salesCount: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative.'],
  },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
