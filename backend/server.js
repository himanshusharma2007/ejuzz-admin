const express = require("express");
const app = express();
const connectDB = require("./db/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminManagementRoutes");
const merchantRoutes = require("./routes/merchantManagementRoutes");
const customersRoutes = require("./routes/customerManagementRoutes");
const shopRoutes = require("./routes/shopManagementRoutes");
const productRoutes = require("./routes/productManagementRoutes");
const orderRoutes = require("./routes/orderRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const seedDatabase = require("./seeder/seeder");
const cors = require("cors");
dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true, // Enable cookies if needed
  })
);

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transactions", transactionRoutes);

app.listen(PORT, async () => {
  await connectDB(process.env.MONGO_URI);
  //    await seedDatabase();
  console.log(`server is runing on the port ${PORT}`);
});
