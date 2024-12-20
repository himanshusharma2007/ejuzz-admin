const mongoose = require("mongoose");

// Wallet Transaction Schema
const walletTransactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    enum: ["ADD", "WITHDRAW", "TRANSFER"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be greater than or equal to 0"],
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "fromModel",
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "toModel",
  },
  fromModel: {
    type: String,
    enum: ["Customer", "Merchant"],
  },
  toModel: {
    type: String,
    enum: ["Customer", "Merchant"],
  }
}, {timestamps: true});

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);

module.exports = WalletTransaction;
