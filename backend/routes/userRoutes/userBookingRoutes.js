
const express = require("express");
const bookingRouter = express.Router();

const { 
    createBooking,
    getBookingHistory, 
    cancelBooking 
} = require("../../controllers/UserControllers/userBookingController");

const {
    authenticateUser,
    authorizeRoles
} = require("../../middleware/authMiddleware");

bookingRouter.use(authenticateUser, authorizeRoles("USER"));

bookingRouter.post("/", createBooking);
bookingRouter.get("/my", getBookingHistory);
bookingRouter.put("/:id/cancel", cancelBooking);

module.exports = bookingRouter;