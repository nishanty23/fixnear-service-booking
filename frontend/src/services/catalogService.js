import api from "./api";

export const getCategories = () => api.get("/user/categories");

export const getNearbyCategories = (latitude, longitude, radiusKm = 10) =>
    api.get("/user/categories/nearby", {
        params: { latitude, longitude, radiusKm }
    });

export const getServices = () => api.get("/user/services");

export const getServiceById = (id) =>
    api.get(`/user/services/${id}`);

export const getProviderReviews = (providerId) =>
    api.get(`/user/reviews/provider/${providerId}`);

export const searchServices = (search, category) =>
    api.get("/user/search", {
        params: {
            ...(search ? { search } : {}),
            ...(category ? { category } : {})
        }
    });

export const createCategory = (name) =>
    api.post("/admin/categories", { name });

export const updateCategory = (id, name) =>
    api.put(`/admin/categories/${id}`, { name });

export const deleteCategory = (id) =>
    api.delete(`/admin/categories/${id}`);