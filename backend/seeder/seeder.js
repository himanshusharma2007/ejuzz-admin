const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Customer = require("../models/customerModel");
const Merchant = require("../models/merchantModel");
const Product = require("../models/productModel");
const Shop = require("../models/shopModel");
const Order = require("../models/orderModel");

const orders = [
  {
    customerId: null, // Will be assigned dynamically
    merchantId: null, // Will be assigned dynamically
    products: [
      { productId: null, quantity: 1 }, // Will be assigned dynamically
    ],
    totalAmount: 8999.99,
    status: "Completed",
  },
  {
    customerId: null,
    merchantId: null,
    products: [
      { productId: null, quantity: 2 }, // Will be assigned dynamically
    ],
    totalAmount: 1199.98,
    status: "Pending",
  },
  {
    customerId: null,
    merchantId: null,
    products: [
      { productId: null, quantity: 3 }, // Will be assigned dynamically
    ],
    totalAmount: 5999.97,
    status: "Cancelled",
  },
];
const customers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    phoneNumber: "+27123456789",
    address: {
      street: "123 Main St",
      city: "Cape Town",
      postalCode: "8001",
      country: "South Africa",
    },
    walletBalance: 1000,
    loyaltyPoints: 100,
    isVerified: true,
  },
  {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    password: "sarah2024",
    phoneNumber: "+27123456790",
    address: {
      street: "45 Beach Road",
      city: "Durban",
      postalCode: "4001",
      country: "South Africa",
    },
    walletBalance: 2500,
    loyaltyPoints: 250,
    isVerified: true,
  },
  {
    name: "Michael Smith",
    email: "michael@example.com",
    password: "mikepass456",
    phoneNumber: "+27123456791",
    address: {
      street: "789 Long Street",
      city: "Pretoria",
      postalCode: "0002",
      country: "South Africa",
    },
    walletBalance: 500,
    loyaltyPoints: 50,
    isVerified: false,
  },
];

const merchants = [
  {
    storeName: "Electronics Hub",
    email: "electronics@example.com",
    password: "merchant123",
    phoneNumber: "+27987654321",
    address: {
      street: "456 Market St",
      city: "Johannesburg",
      postalCode: "2000",
      country: "South Africa",
    },
    isVerified: true,
    payoutBalance: 5000,
    bankAccountDetails: {
      accountNumber: "1234567890",
      bankName: "Standard Bank",
      branch: "Central Branch",
      IFSCCode: "STD0001",
    },
    commission: {
      type: "percentage",
      value: 10,
    },
  },
  {
    storeName: "Fashion Boutique",
    email: "fashion@example.com",
    password: "fashion456",
    phoneNumber: "+27987654322",
    address: {
      street: "789 Style Avenue",
      city: "Cape Town",
      postalCode: "8002",
      country: "South Africa",
    },
    isVerified: true,
    payoutBalance: 7500,
    bankAccountDetails: {
      accountNumber: "0987654321",
      bankName: "ABSA",
      branch: "Fashion District",
      IFSCCode: "ABSA002",
    },
    commission: {
      type: "fixed",
      value: 50,
    },
  },
  {
    storeName: "Home Essentials",
    email: "home@example.com",
    password: "home789",
    phoneNumber: "+27987654323",
    address: {
      street: "321 Home Street",
      city: "Durban",
      postalCode: "4002",
      country: "South Africa",
    },
    isVerified: true,
    payoutBalance: 3000,
    bankAccountDetails: {
      accountNumber: "5678901234",
      bankName: "Nedbank",
      branch: "Coastal",
      IFSCCode: "NED003",
    },
    commission: {
      type: "percentage",
      value: 8,
    },
  },
];

const products = [
  {
    name: "Smartphone XYZ",
    description: "Latest smartphone with amazing features",
    price: 8999.99,
    category: "Electronics",
    tags: ["smartphone", "electronics", "mobile"],
    stock: 50,
    images: [
      {
        url: "https://placeholder.com/smartphone1.jpg",
        altText: "Smartphone front view",
      },
    ],
    specifications: {
      weight: "180g",
      dimensions: "150x70x8mm",
      material: "Aluminum",
      color: "Black",
      brand: "XYZ",
    },
    salesCount: 0,
  },
  {
    name: "Elegant Summer Dress",
    description: "Beautiful floral print summer dress",
    price: 599.99,
    category: "Fashion",
    tags: ["dress", "summer", "women"],
    stock: 100,
    images: [
      {
        url: "https://placeholder.com/dress1.jpg",
        altText: "Summer dress front view",
      },
    ],
    specifications: {
      material: "Cotton",
      sizes: ["S", "M", "L", "XL"],
      color: "Floral Print",
      brand: "StyleCo",
    },
    salesCount: 15,
  },
  {
    name: "Smart Coffee Maker",
    description: "WiFi-enabled coffee maker with smartphone control",
    price: 1999.99,
    category: "Home Appliances",
    tags: ["coffee", "smart home", "appliances"],
    stock: 30,
    images: [
      {
        url: "https://placeholder.com/coffee1.jpg",
        altText: "Coffee maker front view",
      },
    ],
    specifications: {
      capacity: "1.5L",
      power: "1000W",
      material: "Stainless Steel",
      color: "Silver",
      brand: "SmartHome",
    },
    salesCount: 8,
  },
];

const shops = [
  {
    name: "Electronics Hub Store",
    description: "Your one-stop shop for all electronics",
    address: {
      street: "456 Market St",
      city: "Johannesburg",
      postalCode: "2000",
      country: "South Africa",
    },
    contact: {
      phoneNumber: "+27987654321",
      email: "electronics@example.com",
    },
    establishedDate: new Date("2023-01-01"),
    rating: 4.5,
  },
  {
    name: "Fashion Boutique Store",
    description: "Trendy fashion for everyone",
    address: {
      street: "789 Style Avenue",
      city: "Cape Town",
      postalCode: "8002",
      country: "South Africa",
    },
    contact: {
      phoneNumber: "+27987654322",
      email: "fashion@example.com",
    },
    establishedDate: new Date("2023-03-15"),
    rating: 4.8,
  },
  {
    name: "Home Essentials Store",
    description: "Everything you need for your home",
    address: {
      street: "321 Home Street",
      city: "Durban",
      postalCode: "4002",
      country: "South Africa",
    },
    contact: {
      phoneNumber: "+27987654323",
      email: "home@example.com",
    },
    establishedDate: new Date("2023-06-01"),
    rating: 4.2,
  },
];

// Seeder function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing data
    await Customer.deleteMany();
    await Merchant.deleteMany();
    await Product.deleteMany();
    await Shop.deleteMany();
    await Order.deleteMany(); // Clear previous orders
    console.log("Cleared existing data");

    // Hash passwords and create customers
    const hashedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(customer.password, salt);
        return { ...customer, password: hashedPassword };
      })
    );
    const createdCustomers = await Customer.create(hashedCustomers);
    console.log(`${createdCustomers.length} customers created`);

    // Hash passwords and create merchants
    const hashedMerchants = await Promise.all(
      merchants.map(async (merchant) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(merchant.password, salt);
        return { ...merchant, password: hashedPassword };
      })
    );
    const createdMerchants = await Merchant.create(hashedMerchants);
    console.log(`${createdMerchants.length} merchants created`);

    // Add merchantId to products and create them
    const productsWithMerchantId = products.map((product) => ({
      ...product,
      merchantId: createdMerchants[0]._id, // Assigning to first merchant for demo
    }));
    const createdProducts = await Product.create(productsWithMerchantId);
    console.log(`${createdProducts.length} products created`);

    // Add merchantId to shops and create them
    const shopsWithMerchantId = shops.map((shop) => ({
      ...shop,
      merchantId: createdMerchants[0]._id, // Assigning to first merchant for demo
    }));
    const createdShops = await Shop.create(shopsWithMerchantId);
    console.log(`${createdShops.length} shops created`);

    // Update merchant with products
    await Merchant.findByIdAndUpdate(createdMerchants[0]._id, {
      $push: { products: { $each: createdProducts.map((p) => p._id) } },
    });

    // Add dummy orders
    const ordersWithReferences = orders.map((order, index) => ({
      ...order,
      customerId: createdCustomers[index % createdCustomers.length]._id, // Rotate customers
      merchantId: createdMerchants[0]._id, // Assign all to the first merchant for demo
      products: [
        {
          productId: createdProducts[index % createdProducts.length]._id, // Rotate products
          quantity: order.products[0].quantity,
        },
      ],
    }));
    const createdOrders = await Order.create(ordersWithReferences);
    console.log(`${createdOrders.length} orders created`);

    console.log("Database seeded successfully!");
    //   process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run seederx*
module.exports = seedDatabase;
