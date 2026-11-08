import api from "./api";

export const getCategories = () => api.get("/categories");

export const getNearbyCategories = (latitude, longitude, radiusKm = 10) =>
    api.get("/user/categories/nearby", {
        params: { latitude, longitude, radiusKm }
    });

export const getServices = () => api.get("/services");

export const searchServices = (search) =>
    api.get("/user/search", { params: { search } });

export const createCategory = (name) =>
    api.post("/categories", { name });

export const updateCategory = (id, name) =>
    api.put(`/categories/${id}`, { name });

export const deleteCategory = (id) =>
    api.delete(`/categories/${id}`);