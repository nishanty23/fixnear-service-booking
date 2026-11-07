import adminApi from "./adminApi";

// Fetch all provider applications
export const getAllProviderApplications = async (params = {}) => {
    try {
        const response = await adminApi.get("/admin/providers", {
            params
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Fetch single provider application
export const getProviderApplicationById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/providers/${id}`);

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Approve provider application
export const approveProvider = async (id) => {
    try {
        const response = await adminApi.put(
            `/admin/providers/${id}/approve`
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Reject provider application
export const rejectProvider = async (id, reason) => {
    try {
        const response = await adminApi.put(
            `/admin/providers/${id}/reject`,
            { reason, rejectionReason: reason }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Fetch all approved providers
export const getAllApprovedProviders = async (params = {}) => {
    try {
        const response = await adminApi.get(
            "/admin/providers/approved",
            { params }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Fetch single approved provider
export const getApprovedProviderById = async (id) => {
    try {
        const response = await adminApi.get(
            `/admin/providers/approved/${id}`
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Activate or Deactivate provider account
export const updateProviderStatus = async (id, isActive) => {
    try {
        const response = await adminApi.put(
            `/admin/providers/${id}/status`,
            { isActive }
        );

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Aliases for compatibility
export const approveProviderApplication = approveProvider;
export const rejectProviderApplication = rejectProvider;
