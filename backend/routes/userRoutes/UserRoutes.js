
const express = require("express");
const userRouter = express.Router();

const {
    getCategory,
    searchServices,
    getNearbyCategories
} = require("../../controllers/UserControllers/userServiceController");

const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} = require("../../controllers/AuthControllers/authController");

const {
    getServices,
    getServiceById
} = require("../../controllers/ProviderControllers/serviceController");

const {
    getProviders,
    getProviderById
} = require("../../controllers/ProviderControllers/providerController");

const {
    getProviderReviews
} = require("../../controllers/ProviderControllers/reviewController");

const {
    createRequest,
    getMyRequests,
    hideRequestFromHistory,
    cancelRequest
} = require("../../controllers/ProviderControllers/requestController");

const {
    rescheduleBooking
} = require("../../controllers/UserControllers/userBookingController");

const {
    createReview,
    getMyReviews,
    getServiceReviews,
    deleteReview
} = require("../../controllers/UserControllers/userReviewController");

const {
    authenticateUser,
    authorizeRoles
} = require("../../middleware/authMiddleware");

// Public user authentication routes.
userRouter.post("/auth/register", register);
userRouter.post("/auth/login", login);

// Public user discovery routes.
userRouter.get("/categories/nearby", getNearbyCategories);
userRouter.get("/categories", getCategory);
userRouter.get("/search", searchServices);
userRouter.get("/services", getServices);
userRouter.get("/services/search", searchServices);
userRouter.get("/services/:id", getServiceById);
userRouter.get("/providers", getProviders);
userRouter.get("/providers/:id", getProviderById);
userRouter.get("/reviews/provider/:providerId", getProviderReviews);
userRouter.get("/reviews/service/:serviceId", getServiceReviews);

// Authenticated customer routes.
userRouter.get("/auth/me", authenticateUser, getProfile);
userRouter.put("/auth/profile", authenticateUser, updateProfile);
userRouter.put("/auth/change-password", authenticateUser, changePassword);

userRouter.post(
    "/bookings",
    authenticateUser,
    authorizeRoles("USER"),
    createRequest
);
userRouter.get(
    "/bookings/my",
    authenticateUser,
    authorizeRoles("USER"),
    getMyRequests
);
userRouter.put(
    "/bookings/:id/hide",
    authenticateUser,
    authorizeRoles("USER"),
    hideRequestFromHistory
);
userRouter.put(
    "/bookings/:id/cancel",
    authenticateUser,
    authorizeRoles("USER"),
    cancelRequest
);
userRouter.put(
    "/bookings/:id/reschedule",
    authenticateUser,
    authorizeRoles("USER"),
    rescheduleBooking
);

userRouter.post(
    "/reviews",
    authenticateUser,
    authorizeRoles("USER"),
    createReview
);
userRouter.get("/reviews/my", authenticateUser, getMyReviews);
userRouter.delete("/reviews/:id", authenticateUser, deleteReview);


module.exports = userRouter;