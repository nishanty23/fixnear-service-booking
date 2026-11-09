
import { useCallback, useEffect, useState } from "react";
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiX
} from "react-icons/fi";

import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../services/categoryService";
import { validateImage } from "../../utils/imageValidation";

import "../styles/admin.css";

function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllCategories();
            setCategories(response.categories || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to fetch categories."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Open create form
    const handleAddCategory = () => {
        setEditingId(null);
        setFormData({ name: "", description: "" });
        setSelectedImage(null);
        setPreviewImage("");
        setError("");
        setMessage("");
        setShowForm(true);
    };

    // Open edit form
    const handleEditCategory = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: category.description || ""
        });
        setSelectedImage(null);
        setPreviewImage(category.image || "");
        setError("");
        setMessage("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", description: "" });
        setSelectedImage(null);
        setPreviewImage("");
        setError("");
    };

    useEffect(() => {
        return () => {
            if (selectedImage && previewImage.startsWith("blob:")) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [selectedImage, previewImage]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        const validationError = validateImage(file);

        if (validationError) {
            event.target.value = "";
            setSelectedImage(null);
            setPreviewImage(editingId
                ? categories.find(category => category._id === editingId)?.image || ""
                : "");
            setError(validationError);
            return;
        }

        if (selectedImage && previewImage.startsWith("blob:")) {
            URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setError("");
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Create / Update category
    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = formData.name.trim();
        const description = formData.description.trim();

        if (!name) {
            setError("Category name is required.");
            return;
        }

        if (!editingId && !selectedImage) {
            setError("Category image is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const categoryData = new FormData();
            categoryData.append("name", name);
            categoryData.append("description", description);

            if (selectedImage) {
                categoryData.append("image", selectedImage);
            }

            if (editingId) {
                await updateCategory(editingId, categoryData);
                setMessage("Category updated successfully.");
            } else {
                await createCategory(categoryData);
                setMessage("Category created successfully.");
            }

            closeForm();

            await fetchCategories();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const handleDeleteCategory = async (category) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(category._id);
            setError("");
            setMessage("");

            await deleteCategory(category._id);

            setMessage("Category deleted successfully.");
            await fetchCategories();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete category."
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="admin-categories-page">

            {/* Page Heading */}
            <div className="admin-dashboard-heading">
                <div>
                    <h2>Manage Categories</h2>
                    <p>Create and manage service categories on FixNear.</p>
                </div>

                <button
                    className="admin-category-add-btn"
                    onClick={handleAddCategory}
                >
                    <FiPlus />
                    Add Category
                </button>
            </div>

            {/* Success Message */}
            {message && (
                <div className="admin-success-message">
                    {message}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {/* Category Form */}
            {showForm && (
                <div className="admin-category-form-panel">

                    <div className="admin-category-form-header">
                        <h3>
                            {editingId ? "Edit Category" : "Create Category"}
                        </h3>

                        <button
                            type="button"
                            className="admin-modal-close"
                            onClick={closeForm}
                        >
                            <FiX />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="admin-category-form-group">
                            <label htmlFor="category-name">
                                Category Name *
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter category name"
                                maxLength="60"
                                required
                            />
                        </div>

                        <div className="admin-category-form-group">
                            <label htmlFor="category-description">
                                Description
                            </label>

                            <textarea
                                id="category-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter category description"
                                rows="3"
                            />
                        </div>

                        <div className="admin-category-form-group">
                            <label htmlFor="category-image">
                                Category Image {editingId ? "(optional)" : "*"}
                            </label>
                            <input
                                id="category-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                            />
                            {previewImage && (
                                <img
                                    className="admin-category-image-preview"
                                    src={previewImage}
                                    alt="Category preview"
                                />
                            )}
                        </div>

                        <div className="admin-category-form-actions">
                            <button
                                type="button"
                                className="admin-clear-btn"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-category-add-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Category"
                                        : "Create Category"}
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* Categories Table */}
            <div className="admin-users-panel">

                <div className="admin-users-toolbar">
                    <span className="admin-users-count">
                        Total Categories: {categories.length}
                    </span>
                </div>

                <div className="admin-table-wrapper">

                    <table className="admin-users-table">

                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th>Created Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="admin-table-empty">
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="admin-table-empty">
                                        No categories found. Create your first category.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category._id}>
                                        <td>
                                            <img
                                                className="admin-category-table-image"
                                                src={category.image || "/assets/fixnear-icon.png"}
                                                alt={category.name}
                                                onError={(event) => {
                                                    event.currentTarget.src = "/assets/fixnear-icon.png";
                                                }}
                                            />
                                        </td>

                                        <td className="admin-user-name">
                                            {category.name}
                                        </td>

                                        <td>
                                            {category.description || "-"}
                                        </td>

                                        <td>
                                            {new Date(
                                                category.createdAt
                                            ).toLocaleDateString("en-IN")}
                                        </td>

                                        <td>
                                            <div className="admin-table-actions">

                                                <button
                                                    className="admin-view-btn"
                                                    onClick={() =>
                                                        handleEditCategory(category)
                                                    }
                                                >
                                                    <FiEdit2 />
                                                    Edit
                                                </button>

                                                <button
                                                    className="admin-deactivate-btn"
                                                    onClick={() =>
                                                        handleDeleteCategory(category)
                                                    }
                                                    disabled={
                                                        deletingId === category._id
                                                    }
                                                >
                                                    <FiTrash2 />
                                                    {deletingId === category._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>
            </div>

        </div>
    );
}

export default ManageCategories;
