
const mongoose = require("mongoose");
const serviceCategory = require("../../models/ServiceCategory");
const Service = require("../../models/Service");
const ServiceProvider = require("../../models/ServiceProvider");
const Review = require("../../models/Review");

// Get all categories
const getCategory = async (request, response) => {
    try{
        // sort in ascending order
        // mongoose database operations are async. returns mongoose query object
        const categories = await serviceCategory.find().sort({ name: 1 });

        response.status(200).json({
            success: true,
            count: categories.length,
            categories
        })
    }
    catch(error) {
        console.error("Some error occured", error);
        response.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
};

// Services with filters: cat_Id, city, area etc
const searchServices = async (request, response) => {
    try {
        
        const {category, city, area, minPrice, maxPrice} = request.query;
        const filters = {
            isActive: true
        };
        // Object to store the filters
        
        if(category) {
            if(!mongoose.isValidObjectId(category)) {
                return response.status(400).json({
                    success: false,
                    message: "Invalid category id"
                })
            }

            filters.category = category; //Add the category to filters
        }

        if(minPrice !== undefined || maxPrice !== undefined) {
            const min = (minPrice === undefined) ? 0 : Number(minPrice);
            const max = (maxPrice === undefined) ? Infinity : Number(maxPrice);
            
            if(min < 0 || max < min) {
                return response.status(400).json({
                    success: false,
                    message: "Price range Invalid"
                })
            }
            filters.price = {};
            filters.price.$gte = min;        
            filters.price.$lte = max;        
        }
        // find() are async
        const services = await Service.find(filters)
        .populate("category", "name")
        .populate({
            path: "provider",
            match: {
                availability: true,
                // Conditional object spreading: if city has value return the city filter object else return empty
                ...(city ? {
                    city: {
                        $regex: city.trim(),  //pattern matching
                        $options: "i"  //make case in-sensitive
                    }
                } : {}),
                ...(area ? {
                    area: {
                        $regex: area.trim(),
                        $options: "i"
                    }
                } : {})
            },
            // user in ServiceProvider model contain objectId from User model. To get the name from the objectID:
            populate: {
                path: "user",
                select: "name"
            }
        })
        .sort({ price: 1 });

        // removes services where provider is null
        const availableServices = services.filter((s) => s.provider != null);

        return response.status(200).json({
            success: true,
            count: availableServices.length,
            services: availableServices
        })

    } catch (error) {
        response.status(500).json({
            success: false,
            message: "Internal error"
        })
    }
}

// get details of service by Id
const getServiceDetails = async (request, response) => {
    try {
        
        const { id } = request.params;

        if(!mongoose.isValidObjectId(id)) {
            return response.status(400).json({
                success: false,
                message: "Invalid service ID"
            })
        }

        const service = await Service.findOne({ _id: id, isActive: true})
            .populate("category", "name")
            .populate({
                path: "provider",
                populate: { path: "user", select: "name" }
            });

            if(!service || !service.provider || !service.provider.isAvailability) {
                return response.status(404).json({
                    success: false,
                    message: "Service not available"
                })
            }

            return response.status(200).json({
                success: true,
                service
            })

    } catch (error) {
        console.log(error);
        response.status(500).json({
            success: false,
            message: "Internal error occured"
        })
    }
}

// Get service provider profile and reviews
const getProviderDetails = async (request, response) => {
    try {
        
        const {id} = request.params;

        if(!mongoose.isValidObjectId(id)) {
            return response.status(400).json({
                success: false,
                message: "Invalid ID"
            })
        }

        const provider = await ServiceProvider.findById(id).populate({path: "user", select: "name"});
        if(!provider) {
            return response.status(404).json({
                success: false,
                message: "No provider found"
            })
        }

        const reviews = await Review.find({provider: id})
            .populate({path: "user", select: "name"})
            .sort({ createdAt: -1 });
        
        return response.status(200).json({
            success: true,
            provider,
            reviews
        })

    } catch (error) {
        response.status(500).json({
            success: false,
            message: "Internal Error"
        })
    }
}


module.exports = {
    getCategory,
    searchServices,
    getServiceDetails,
    getProviderDetails
}