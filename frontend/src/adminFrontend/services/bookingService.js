import adminApi from "./adminApi";

// Fetch all bookings with search, status filter, and pagination
export const getAllBookings = async (params = {}) => {
    try {
        const response = await adminApi.get("/admin/bookings", {
            params
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Fetch single booking by ID
export const getBookingById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/bookings/${id}`);

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

