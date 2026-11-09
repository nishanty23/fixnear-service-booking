import api from "./api";

export const submitReview = (serviceRequest, rating, comment) =>
    api.post("/user/reviews", { bookingId: serviceRequest, rating, comment });