
const express = require("express");
const {
    getCategories
} = require("../../controllers/UserControllers/userServiceController");

const {
    authenticateUser,
    authorizeRoles
} = require("../../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.use(authenticateUser, authorizeRoles("USER"));

userRouter.get("/categories", getCategories);

module.exports = userRouter;