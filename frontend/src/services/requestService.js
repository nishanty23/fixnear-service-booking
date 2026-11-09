import api from "./api";

export const getCustomerRequests = () => api.get("/user/bookings/my");

export const getProviderRequests = () => api.get("/requests/provider");

export const createRequest = (serviceId, details) =>
    api.post("/user/bookings", { service: serviceId, ...details });

export const cancelRequest = (id) =>
    api.put(`/user/bookings/${id}/cancel`);

export const updateRequestStatus = (id, status) =>
    api.put(`/requests/${id}/status`, { status });
export const hideRequestFromHistory = (id) =>
    api.put(`/user/bookings/${id}/hide`);

export const rescheduleRequest = (id, scheduledDate) =>
    api.put(`/user/bookings/${id}/reschedule`, {
        scheduleDate: scheduledDate
    });