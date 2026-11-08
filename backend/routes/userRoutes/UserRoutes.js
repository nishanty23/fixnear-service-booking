
const express = require("express");
const userRouter = express.Router();

const {
    getCategory,
    searchServices,
    getServiceDetails,
    getProviderDetails,
    getNearbyCategories
} = require("../../controllers/UserControllers/userServiceController");

const {
    authenticateUser,
    authorizeRoles
} = require("../../middleware/authMiddleware");


// Nearby categories are public because location discovery does not require login.
userRouter.get("/categories/nearby", getNearbyCategories);
userRouter.get("/search", searchServices);

userRouter.use(authenticateUser, authorizeRoles("USER"));

userRouter.get("/categories", getCategory);
userRouter.get("/:id", getServiceDetails);
userRouter.get("/provider/:id", getProviderDetails);

module.exports = userRouter;