import adminApi from "./adminApi";

// Admin Login
export const adminLogin = async (credentials) => {
    try {
        const response = await adminApi.post(
            "/admin/auth/login",
            credentials
        );

        // Save Admin JWT Token
        const token = response.data.token;

        if (!token) {
            throw new Error("Admin token not received");
        }

        localStorage.setItem("adminToken", token);

        return response.data;

    } catch (error) {
        throw error.response?.data || error;
    }
};

// Admin Logout
export const adminLogout = () => {
    localStorage.removeItem("adminToken");
};

// Check Admin Authentication
export const isAdminAuthenticated = () => {
    return !!localStorage.getItem("adminToken");
};
