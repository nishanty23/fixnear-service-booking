
const mongoose = require("mongoose");
const ServiceRequest = require("../../models/ServiceRequest");
const Service = require("../../models/Service");

// Create new booking service
const createBooking = async (request, response) => {
    try {
        
        const { serviceId, address, city, area, pincode, scheduledDate, notes } = request.body;

        if (!serviceId || !address || !city || !area || !pincode || !scheduledDate) {
            return response.status(400).json({
                success: false,
                message: "Service ID, full address, city, area, pincode, and scheduled date are required"
            });
        }

        if (!mongoose.isValidObjectId(serviceId)) {
            return response.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        const bookingDate = new Date(scheduledDate);
        if (isNaN(bookingDate.getTime()) || bookingDate <= new Date()) {
            return response.status(400).json({
                success: false,
                message: "Scheduled date must be a valid future date"
            });
        }

        const service = await Service.findOne({ _id: serviceId, isActive: true}).populate("provider");

        if(!service || !service.provider || !service.provider.availability) {
            return response.status(404).json({
                success: false,
                message: "Service or provider is unavailable"
            })
        }

        const booking = await ServiceRequest.create({
            user: request.user._id,
            service: service._id,
            provider: service.provider._id,
            address: address.trim(),
            city: city.trim(),
            area: area.trim(),
            pincode: pincode.trim(),
            scheduledDate: bookingDate,
            notes: notes ? notes.trim() : "",
            status: "PENDING"
        })

        return response.status(201).json({
            success: true,
            message: "Booking requested",
            booking
        });
    } 
    catch (error) {
        console.log(error);
        response.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
};


// Get booking history
const getBookingHistory = async (req, res) => {
    try {

        const bookings = await ServiceRequest.find({ user: req.user._id })
            .populate({path: "service", select: "name price priceType"})
            .populate({path: "provider",
                populate: {path: "user", select: "name email phone"}
             })
             .sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        })

    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

// Get booking by Id
const getBookingById = async (req, res) => {
    try {

        const {id} = req.params;

        if(!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            })
        }

        const booking = await ServiceRequest.findById({ _id: id})
            .populate({
                path: "service", 
                select: "name description price priceType"})
            .populate({
                path: "provider", 
                select: "businessName phone city area averageRating",
                populate: {
                    path: "user",
                    select: "name email"
                }
            });
        if(!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if(booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        return res.status(200).json({
            success: true,
            booking
        })
         
    }
    catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal error"
        })
    }
}

// Reschedule booking
const rescheduleBooking = async (req, res) => {
    try{

        const { id } = req.params;
        const { scheduleDate } = req.body;

        if(!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking Id"
            })
        }

        if(!scheduleDate) {
            return res.status(400).json({
                success: false,
                message: "New date required"
            })
        }

        const newDate = new Date(scheduleDate);
        // Check if the date is valid and if the date is > today
        if(isNaN(newDate.getTime()) || newDate <= new Date() ) {
            return res.status(400).json({
                success: false,
                message: "New date must be a valid future date"
            });
        }

        const booking = await ServiceRequest.findById(id);

        if(!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            })
        }

        // Checking if the booking belongs to the logged in user
        // Check the userId in serviceRequest collection with the userId from the request
        if(booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        const lockedStatuses = ["IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"];
        if(lockedStatuses.includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot reschedule booking with status ${booking.status}`
            });
        }

        booking.scheduledDate = newDate;
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking rescheduled successfully",
            booking
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

// Cancel pending booking
const cancelBooking = async (req, res) => {
    try{
        const { id } = req.params;

        if(!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                success: false,
                message: "No booking found"
            })
        }

        const booking = await ServiceRequest.findOne({ _id: id, user: req.user._id}) //refers to the ID of the currently authenticated user
        if(!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            })
        }
        // if(!["PENDING", "ACCEPTED"].includes(booking.status)) {
        if(booking.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a booking that is ${booking.status}`
            })
        }
        booking.status = "CANCELLED";
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

module.exports = {
    createBooking,
    getBookingHistory,
    getBookingById,
    rescheduleBooking,
    cancelBooking
}