const mongoose = require("mongoose");

// Define the order schema
const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: [true, "Customer ID is required"],
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    required: [true, "Merchant ID is required"],
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"],
  },
  status: {
    type: String,
    enum: {
      values: ["New", "Preparing", "Picked Up", "Complete", "Reject"],
      message: "{VALUE} is not a valid status",
    },
    default: "New",
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to validate embedded documents
orderSchema.pre("save", function (next) {
  if (!this.products || this.products.length === 0) {
    return next(new Error("Order must contain at least one product"));
  }
  next();
});

// Create a function to handle errors
orderSchema.statics.handleValidationError = function (error) {
  const errors = {};
  if (error.errors) {
    for (const key in error.errors) {
      if (error.errors[key].message) {
        errors[key] = error.errors[key].message;
      }
    }
  } else {
    errors.general = "An unknown error occurred";
  }
  return errors;
};

module.exports = mongoose.model("Order", orderSchema);
