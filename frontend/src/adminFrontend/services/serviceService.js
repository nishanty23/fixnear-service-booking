import adminApi from "./adminApi";

// Fetch all services with search, status filter, and pagination
export const getAllServices = async (params = {}) => {
    try {
        const response = await adminApi.get("/admin/services", {
            params
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Fetch single service by ID
export const getServiceById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/services/${id}`);

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Activate or Deactivate service
export const updateServiceStatus = async (id, isActive) => {
    try {
        const response = await adminApi.put(
            `/admin/services/${id}/status`,
            { isActive }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

