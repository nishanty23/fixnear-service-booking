import { useEffect, useState } from "react";
import api from "../services/api";
import MessagePage from "../components/MessagePage";

export default function AdminDashboard({ user }) {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [message, setMessage] = useState("");

    const load = async () => {
        try {
            const response = await api.get("/admin/categories");
            setCategories(response.data.categories || []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to load categories.");
        }
    };

    useEffect(() => {
        if (user?.role === "ADMIN") load();
    }, [user]);

    const addCategory = async (event) => {
        event.preventDefault();

        try {
            await api.post("/admin/categories", { name: categoryName });
            setCategoryName("");
            setMessage("Category created successfully.");
            await load();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not create category.");
        }
    };

    const startEdit = (category) => {
        setEditId(category._id);
        setEditName(category.name);
        setMessage("");
    };

    const updateCategory = async (event) => {
        event.preventDefault();

        try {
            await api.put(`/admin/categories/${editId}`, {
                name: editName
            });

            setEditId(null);
            setEditName("");
            setMessage("Category updated successfully.");
            await load();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not update category.");
        }
    };

    const deleteCategory = async (categoryId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/admin/categories/${categoryId}`);
            setMessage("Category deleted successfully.");
            await load();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not delete category.");
        }
    };

    if (!user || user.role !== "ADMIN") {
        return <MessagePage title="Access denied" text="Administrator access is required." />;
    }

    return (
        <section className="section dashboard-section">
            <span className="eyebrow">ADMINISTRATION</span>
            <h2>Admin Dashboard</h2>
            <p>Manage FixNear service categories.</p>

            <div className="dashboard-stats">
                <div><strong>{categories.length}</strong><span>Active categories</span></div>
                <div><strong>3</strong><span>Account roles</span></div>
                <div><strong>24/7</strong><span>Platform access</span></div>
            </div>

            <form className="inline-form" onSubmit={addCategory}>
                <input
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    required
                    placeholder="New category name"
                />
                <button className="btn btn-primary" type="submit">
                    Add Category
                </button>
            </form>

            {message && <p>{message}</p>}

            <div className="category-grid">
                {categories.map(category => (
                    <div className="category-card" key={category._id}>
                        {editId === category._id ? (
                            <form onSubmit={updateCategory}>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    required
                                />
                                <button className="btn btn-primary" type="submit">
                                    Save
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={() => setEditId(null)}
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <>
                                <strong>{category.name}</strong>

                                <div className="category-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => startEdit(category)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => deleteCategory(category._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}