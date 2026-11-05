
const mongoose = require("mongoose");
const serviceCategory = require("../../models/ServiceCategory");
const service = require("../../models/Service");
const serviceProvider = require("../../models/ServiceProvider");
const review = require("../../models/Review");

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


module.exports = {
    getCategory
}