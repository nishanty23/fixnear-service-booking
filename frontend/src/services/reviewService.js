import api from "./api";

export const submitReview = (serviceRequest, rating, comment) =>
    api.post("/reviews", { serviceRequest, rating, comment });