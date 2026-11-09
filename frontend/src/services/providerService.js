import api from "./api";

export const createProviderProfile = (profile) =>
    api.post("/providers/profile", profile);

export const createService = (service) =>
    api.post("/services", service);

export const updateService = (id, service) =>
    api.put(`/services/${id}`, service);