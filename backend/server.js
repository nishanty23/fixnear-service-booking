
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const providerRoutes = require("./routes/providerRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// User routes Imports
const userRouter = require("./routes/userRoutes/UserRoutes");
const userBookingRouter = require("./routes/userRoutes/userBookingRoutes");
const userReviewRouter = require("./routes/userRoutes/userReviewRoutes");


//admin Routes imports
const adminAuthRoutes = require("./routes/adminRoutes/adminAuthRoutes");
const dashboardRoutes = require("./routes/adminRoutes/dashboardRoutes");
const adminUserRoutes = require("./routes/adminRoutes/userRoutes");
const adminProviderRoutes = require("./routes/adminRoutes/providerRoutes");
const adminServiceRoutes = require("./routes/adminRoutes/serviceRoutes");
const adminBookingRoutes = require("./routes/adminRoutes/bookingRoutes");

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
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reviews", reviewRoutes);

// User API routes
app.use("/api/user", userRouter);
app.use("/api/user/booking", userBookingRouter);
app.use("/api/user/review", userReviewRouter);

//Admin API routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/providers", adminProviderRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`FixNear server running on port ${PORT}`);
  });
};

startServer();
