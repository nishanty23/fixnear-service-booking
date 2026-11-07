import adminApi from "./adminApi";

// Fetch Admin Dashboard Statistics
export const getDashboardStats = async () => {
    try {
        const response = await adminApi.get("/admin/dashboard");

        return response.data;

    } catch (error) {
        throw error.response?.data || error;
    }
};

