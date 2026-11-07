
import { useCallback, useEffect, useState } from "react";
import {
    FiSearch,
    FiX,
    FiEye,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";

import {
    getAllUsers,
    getUserById,
    updateUserStatus
} from "../services/userService";

import "../styles/admin.css";

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        totalUsers: 0,
        currentPage: 1,
        totalPages: 1,
        pageLimit: 10
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllUsers({
                search,
                page,
                limit: 10
            });

            setUsers(response.users || []);

            setPagination(response.pagination || {
                totalUsers: 0,
                currentPage: 1,
                totalPages: 1,
                pageLimit: 10
            });

        } catch (err) {
            setError(err.message || "Failed to load users.");
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        setMessage("");
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    const handleViewUser = async (id) => {
        try {
            setDetailsLoading(true);
            setError("");

            const response = await getUserById(id);
            setSelectedUser(response.user);

        } catch (err) {
            setError(err.message || "Failed to fetch user details.");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStatusChange = async (user) => {
        const newStatus = user.isActive === false;

        const confirmed = window.confirm(
            `Are you sure you want to ${
                newStatus ? "activate" : "deactivate"
            } ${user.name}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(user._id);
            setError("");
            setMessage("");

            await updateUserStatus(user._id, newStatus);

            setMessage(
                `${user.name} has been ${
                    newStatus ? "activated" : "deactivated"
                } successfully.`
            );

            if (selectedUser?._id === user._id) {
                setSelectedUser((prev) => ({
                    ...prev,
                    isActive: newStatus
                }));
            }

            await fetchUsers();

        } catch (err) {
            setError(err.message || "Failed to update user status.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="admin-users-page">

            <div className="admin-dashboard-heading">
                <div>
                    <h2>Manage Users</h2>
                    <p>View and manage registered users.</p>
                </div>
            </div>

            {message && (
                <div className="admin-success-message" role="status">
                    {message}
                </div>
            )}

            {error && (
                <div className="admin-error" role="alert">
                    {error}
                </div>
            )}

            <div className="admin-users-panel">

                <div className="admin-users-toolbar">

                    <form
                        className="admin-users-search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="search"
                            placeholder="Search users..."
                            aria-label="Search users"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />

                        <button type="submit">
                            <FiSearch className="admin-action-icon" />
                            <span>Search</span>
                        </button>

                        <button
                            type="button"
                            className="admin-clear-btn"
                            onClick={handleClearSearch}
                        >
                            <FiX className="admin-action-icon" />
                            <span>Clear</span>
                        </button>
                    </form>

                    <span className="admin-users-count">
                        Total Users: {pagination.totalUsers}
                    </span>

                </div>

                <div className="admin-table-wrapper">

                    <table className="admin-users-table">

                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="admin-table-empty">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="admin-table-empty">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id}>

                                        <td className="admin-user-name">
                                            {user.name}
                                        </td>

                                        <td>{user.email}</td>
                                        <td>{user.role}</td>

                                        <td>
                                            <span
                                                className={`admin-status-badge ${
                                                    user.isActive !== false
                                                        ? "is-active"
                                                        : "is-inactive"
                                                }`}
                                            >
                                                {user.isActive !== false
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            {user.createdAt
                                                ? new Date(
                                                    user.createdAt
                                                ).toLocaleDateString("en-IN")
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="admin-table-actions">

                                                <button
                                                    className="admin-view-btn"
                                                    onClick={() =>
                                                        handleViewUser(user._id)
                                                    }
                                                    disabled={detailsLoading}
                                                >
                                                    <FiEye className="admin-action-icon" />
                                                    <span>View</span>
                                                </button>

                                                <button
                                                    className={
                                                        user.isActive !== false
                                                            ? "admin-deactivate-btn"
                                                            : "admin-activate-btn"
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(user)
                                                    }
                                                    disabled={
                                                        updatingId === user._id
                                                    }
                                                >
                                                    {updatingId === user._id
                                                        ? "Updating..."
                                                        : user.isActive !== false
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

                <div className="admin-users-pagination">

                    <span>
                        Page {pagination.currentPage} of{" "}
                        {Math.max(1, pagination.totalPages)}
                    </span>

                    <div>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={loading || page <= 1}
                        >
                            <FiChevronLeft />
                            Previous
                        </button>

                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={
                                loading ||
                                page >= pagination.totalPages
                            }
                        >
                            Next
                            <FiChevronRight />
                        </button>
                    </div>

                </div>

            </div>

            {selectedUser && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="User details"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="admin-modal-header">

                            <h3>User Details</h3>

                            <button
                                className="admin-modal-close"
                                aria-label="Close user details"
                                onClick={() => setSelectedUser(null)}
                            >
                                <FiX />
                            </button>

                        </div>

                        <div className="admin-user-details">

                            <p>
                                <strong>Name:</strong> {selectedUser.name}
                            </p>

                            <p>
                                <strong>Email:</strong> {selectedUser.email}
                            </p>

                            <p>
                                <strong>Role:</strong> {selectedUser.role}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedUser.isActive !== false
                                    ? "Active"
                                    : "Inactive"}
                            </p>

                            <p>
                                <strong>Joined:</strong>{" "}
                                {selectedUser.createdAt
                                    ? new Date(
                                        selectedUser.createdAt
                                    ).toLocaleString("en-IN")
                                    : "-"}
                            </p>

                        </div>

                        <button
                            className="admin-refresh-btn"
                            onClick={() => setSelectedUser(null)}
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

export default ManageUsers;
