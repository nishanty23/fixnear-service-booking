
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Route imports
const providerRoutes = require("./routes/providerRoutes");
const providerAuthRoutes = require("./routes/providerAuthRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");

// User routes Imports
const userRouter = require("./routes/userRoutes/UserRoutes");


//admin Routes imports
const adminAuthRoutes = require("./routes/adminRoutes/adminAuthRoutes");
const dashboardRoutes = require("./routes/adminRoutes/dashboardRoutes");
const adminUserRoutes = require("./routes/adminRoutes/userRoutes");
const adminProviderRoutes = require("./routes/adminRoutes/providerRoutes");
const adminServiceRoutes = require("./routes/adminRoutes/serviceRoutes");
const adminBookingRoutes = require("./routes/adminRoutes/bookingRoutes");
const adminReviewRoutes = require("./routes/adminRoutes/reviewRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FixNear API is running"
  });
});

// API routes
app.use("/api/providers", providerRoutes);
app.use("/api/provider/auth", providerAuthRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);

// User API routes
app.use("/api/user", userRouter);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

//Admin API routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/providers", adminProviderRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`FixNear server running on port ${PORT}`);
  });
};

startServer();
