import adminApi from "./adminApi";

// Fetch all users with search and pagination
export const getAllUsers = async (params = {}) => {
    try {
        const response = await adminApi.get("/admin/users", {
            params
        });

        return response.data;

    } catch (error) {
        throw error.response?.data || error;
    }
};

// Fetch single user by ID
export const getUserById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/users/${id}`);

        return response.data;

    } catch (error) {
        throw error.response?.data || error;
    }
};

// Activate or Deactivate user
export const updateUserStatus = async (id, isActive) => {
    try {
        const response = await adminApi.put(
            `/admin/users/${id}/status`,
            { isActive }
        );

        return response.data;

    } catch (error) {
        throw error.response?.data || error;
    }
};

