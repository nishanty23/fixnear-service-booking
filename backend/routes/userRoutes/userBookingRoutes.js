
const express = require("express");
const bookingRouter = express.Router();

const { 
    createBooking,
    getBookingById,
    getBookingHistory, 
    rescheduleBooking,
    cancelBooking
        
} = require("../../controllers/UserControllers/userBookingController");

const {
    authenticateUser,
    authorizeRoles
} = require("../../middleware/authMiddleware");

bookingRouter.use(authenticateUser, authorizeRoles("USER"));

bookingRouter.post("/", createBooking);
bookingRouter.get("/my", getBookingHistory);
bookingRouter.get("/:id", getBookingById);
bookingRouter.put("/:id/reschedule", rescheduleBooking);
bookingRouter.put("/:id/cancel", cancelBooking);

module.exports = bookingRouter;