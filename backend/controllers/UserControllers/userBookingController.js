
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
    cancelBooking
}