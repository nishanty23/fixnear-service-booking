
const express = require("express");
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

const userRouter = express.Router();

userRouter.use(authenticateUser, authorizeRoles("USER"));

userRouter.get("/categories", getCategory);
userRouter.get("/search", searchServices);
userRouter.get("/:id", getServiceDetails);
userRouter.get("/provider/:id", getProviderDetails);

module.exports = userRouter;