import api from "./api";

export const getCustomerRequests = () => api.get("/requests/my");

export const getProviderRequests = () => api.get("/requests/provider");

export const createRequest = (serviceId, details) =>
    api.post("/requests", { service: serviceId, ...details });

export const cancelRequest = (id) =>
    api.put(`/requests/${id}/cancel`);

export const updateRequestStatus = (id, status) =>
    api.put(`/requests/${id}/status`, { status });
export const hideRequestFromHistory = (id) =>
    api.put(`/requests/${id}/hide`);