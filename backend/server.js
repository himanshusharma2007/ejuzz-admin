const express = require("express");
const app = express();
const connectDB = require("./db/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminManagementRoutes");
const merchantRoutes = require("./routes/merchantManagementRoutes");
const customersRoutes = require("./routes/customerManagementRoutes");
const shopRoutes = require("./routes/shopManagementRoutes");
const productRoutes = require("./routes/productManagementRoutes");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const seedDatabase = require("./seeder/seeder");
dotenv.config();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/product", productRoutes);

app.listen(PORT, async () => {
  await connectDB(process.env.MONGO_URI);
  //    await seedDatabase();
  console.log(`server is runing on the port ${PORT}`);
});
