const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/cryptoFunc");

// Schema for Merchant Information
const merchantSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: [true, "Name is required."], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required."], 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, "Invalid email address."] 
  },
  phoneNo: { 
    type: String, 
    required: [true, "Phone number is required."], 
    match: [/^\d{10,15}$/, "Invalid phone number."] 
  },
  loginId: { 
    type: String, 
    default: null 
  },
  password: { 
    type: String, 
    default: null, 
    minlength: [8, "Password must be at least 8 characters long."],
    select: false,
  },
  isVerify: { 
    type: Boolean, 
    default: false 
  },
  businessName: { 
    type: String, 
    required: [true, "Business name is required."],
    trim: true 
  },
  businessCategory: { 
    type: String, 
    required: [true, "Business category is required."] 
  },
  businessAddress: { 
    type: String, 
    required: [true, "Business address is required."], 
    trim: true 
  },
  businessRegistrationNumber: {
     type: String,
     required: [true, "Business registration number is required."],
     unique: true  
   },
  socialMediaLink: { 
    type: String, 
    match: [/^https?:\/\/.+/, "Invalid social media link."] 

  },
  bankInformation: {
    branchCode: { 
      type: String, 
      required: [true, "Branch Code is required."] 
    },
    accountName: { 
      type: String, 
      required: [true, "Bank account name is required."] 
    },
    accountHolder: { 
      type: String, 
      required: [true, "Account holder name is required."] 
    },
    bankName: { 
      type: String, 
      required: [true, "Bank name is required."] 
    },
    branchName: { 
      type: String, 
      required: [true, "Bank branch name is required."] 
    },
    accountNumber: { 
      type: String, 
      required: [true, "Account number is required."] 
    },
  },
  govId: { 
    url: { 
    type: String, 
    required: [true, "Government ID file URL is required."] 
  }, 
  public_id: { 
    type: String, 
    required: [true, "Government ID file public ID is required."],
  } 
},
  businessLicense: { 
    url: { 
      type: String, 
      required: [true, "Business license file URL is required."] 
    }, 
    public_id: { 
      type: String, 
      required: [true, "Business license file public ID is required."] 
    } 
  },
  taxDocument: { 
    url: { 
      type: String, 
      required: [true, "Tax document file URL is required."] 
    }, 
    public_id: { 
      type: String, 
      required: [true, "Tax document file public ID is required."] 
    } 
  },
  products: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "product" 
    }
  ],
  payoutBalance: { 
    type: Number, 
    default: 0, 
    min: [0, "Payout balance cannot be negative."] 
  },
  ratings: [
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "customer", required: [true, "Customer Id is required for rating."] 
      },
      rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: [true, "Rating number is required."] 
      },
      comment: { 
        type: String, 
        default: "" 
      },
    },
  ],
}, { timestamps: true });

// Middleware to encrypt bank information before saving
merchantSchema.pre("save", function (next) {
  if (this.isModified("bankInformation")) {
    this.bankInformation.branchCode = encrypt(this.bankInformation.branchCode);
    this.bankInformation.accountName = encrypt(this.bankInformation.accountName);
    this.bankInformation.accountHolder = encrypt(this.bankInformation.accountHolder);
    this.bankInformation.bankName = encrypt(this.bankInformation.bankName);
    this.bankInformation.branchName = encrypt(this.bankInformation.branchName);
    this.bankInformation.accountNumber = encrypt(this.bankInformation.accountNumber);
  }
  next();
});

// Static method to decrypt bank information
merchantSchema.methods.decryptBankInfo = function () {
  return {
    branchCode: decrypt(this.bankInformation.branchCode),
    accountName: decrypt(this.bankInformation.accountName),
    accountHolder: decrypt(this.bankInformation.accountHolder),
    bankName: decrypt(this.bankInformation.bankName),
    branchName: decrypt(this.bankInformation.branchName),
    accountNumber: decrypt(this.bankInformation.accountNumber),
  };
};

const Merchant = mongoose.model("Merchant", merchantSchema);

module.exports = Merchant;
