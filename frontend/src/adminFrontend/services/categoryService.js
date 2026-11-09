
import adminApi from "./adminApi";

// Fetch all categories
export const getAllCategories = async () => {
    const response = await adminApi.get("/admin/categories");
    return response.data;
};

// Create category
export const createCategory = async (categoryData) => {
    const response = await adminApi.post(
        "/admin/categories",
        categoryData
    );
    return response.data;
};

// Update category
export const updateCategory = async (id, categoryData) => {
    const response = await adminApi.put(
        `/admin/categories/${id}`,
        categoryData
    );
    return response.data;
};

// Delete category
export const deleteCategory = async (id) => {
    const response = await adminApi.delete(
        `/admin/categories/${id}`
    );
    return response.data;
};
