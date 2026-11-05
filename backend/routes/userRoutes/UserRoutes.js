
const express = require("express");
const userRouter = express.Router();

const {
    getCategory,
    searchServices,
    getServiceDetails,
    getProviderDetails
} = require("../../controllers/UserControllers/userServiceController");

const {
    authenticateUser,
    authorizeRoles
} = require("../../middleware/authMiddleware");


userRouter.use(authenticateUser, authorizeRoles("USER"));

userRouter.get("/categories", getCategory);
userRouter.get("/search", searchServices);
userRouter.get("/:id", getServiceDetails);
userRouter.get("/provider/:id", getProviderDetails);

module.exports = userRouter;