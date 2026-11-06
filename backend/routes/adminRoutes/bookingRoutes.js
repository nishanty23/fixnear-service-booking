
const express = require("express");
const router = express.Router();

const authenticateAdmin = require("../../middleware/adminMiddleware/adminAuthMiddleware");

const {
  getAllBookings,
  getBookingById
} = require("../../controllers/adminControllers/bookingController");

// GET ALL BOOKINGS
router.get("/", authenticateAdmin, getAllBookings);

// GET BOOKING BY ID
router.get("/:id", authenticateAdmin, getBookingById);

module.exports = router;
