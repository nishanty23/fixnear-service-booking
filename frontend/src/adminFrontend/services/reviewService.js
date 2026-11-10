
import adminApi from "./adminApi";

// Fetch all reviews with search, rating filter and pagination
export const getAllReviews = async (params = {}) => {
    try {
        const response = await adminApi.get("/admin/reviews", {
            params
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Fetch single review by ID
export const getReviewById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/reviews/${id}`);

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete review
export const deleteReview = async (id) => {
    try {
        const response = await adminApi.delete(`/admin/reviews/${id}`);

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
