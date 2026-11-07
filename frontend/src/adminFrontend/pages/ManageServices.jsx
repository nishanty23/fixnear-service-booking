import {
    FiSearch,
    FiX,
    FiEye,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import { useCallback, useEffect, useState } from "react";
import {
    getAllServices,
    getServiceById,
    updateServiceStatus
} from "../services/serviceService";
import "../styles/admin.css";

function ManageServices() {
    const [services, setServices] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalServices: 0,
        pageLimit: 10
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    // Fetch all services
    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: 10
            };

            if (search) params.search = search;

            if (status !== "ALL") {
                params.status = status;
            }

            const response = await getAllServices(params);

            setServices(response.services || []);

            setPagination({
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1,
                totalServices: response.pagination?.totalServices ?? 0,
                pageLimit: response.pagination?.pageLimit || 10
            });

        } catch (err) {
            setError(err.message || "Failed to fetch services.");
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Search services
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
        setMessage("");
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    // View service details
    const handleViewService = async (id) => {
        try {
            setDetailsLoading(true);
            setError("");

            const response = await getServiceById(id);

            setSelectedService(response.service);

        } catch (err) {
            setError(err.message || "Failed to fetch service details.");
        } finally {
            setDetailsLoading(false);
        }
    };

    // Activate / Deactivate service
    const handleStatusChange = async (service) => {
        const newStatus = service.isActive === false;

        const confirmed = window.confirm(
            `Are you sure you want to ${
                newStatus ? "activate" : "deactivate"
            } ${service.name}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(service._id);
            setError("");
            setMessage("");

            await updateServiceStatus(service._id, newStatus);

            setMessage(
                `${service.name} has been ${
                    newStatus ? "activated" : "deactivated"
                } successfully.`
            );

            if (selectedService?._id === service._id) {
                setSelectedService((prev) => ({
                    ...prev,
                    isActive: newStatus
                }));
            }

            await fetchServices();

        } catch (err) {
            setError(err.message || "Failed to update service status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const totalPages = Math.max(1, pagination.totalPages);

    return (
        <div className="admin-services-page">

            {/* Page Heading */}

            <div className="admin-dashboard-heading">
                <div>
                    <h2>Manage Services</h2>
                    <p>View and manage services listed on FixNear.</p>
                </div>
            </div>

            {message && (
                <div className="admin-success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {/* Services Panel */}

            <div className="admin-users-panel">

                <div className="admin-users-toolbar">

                    <form
                        className="admin-users-search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="search"
                            placeholder="Search service name..."
                            value={searchInput}
                            onChange={(e) =>
                                setSearchInput(e.target.value)
                            }
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

                    <select
                        className="admin-provider-filter"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="ALL">All Services</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <span className="admin-users-count">
                        Total Services: {pagination.totalServices}
                    </span>

                </div>

                {/* Services Table */}

                <div className="admin-table-wrapper">

                    <table className="admin-users-table">

                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Provider</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="admin-table-empty">
                                        Loading services...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-table-empty">
                                        No services found.
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service._id}>

                                        <td className="admin-user-name">
                                            {service.name}
                                        </td>

                                        <td>
                                            {service.provider?.businessName || "-"}
                                        </td>

                                        <td>
                                            {service.category?.name || "-"}
                                        </td>

                                        <td>
                                            {[
                                                service.provider?.area,
                                                service.provider?.city
                                            ]
                                                .filter(Boolean)
                                                .join(", ") || "-"}
                                        </td>

                                        <td>
                                            ₹{service.price}{" "}
                                            <small>
                                                {service.priceType === "HOURLY"
                                                    ? "/hr"
                                                    : service.priceType === "STARTING_FROM"
                                                        ? "onwards"
                                                        : ""}
                                            </small>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-status-badge ${
                                                    service.isActive
                                                        ? "is-active"
                                                        : "is-inactive"
                                                }`}
                                            >
                                                {service.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-table-actions">

                                                <button
                                                    className="admin-view-btn"
                                                    onClick={() =>
                                                        handleViewService(service._id)
                                                    }
                                                    disabled={detailsLoading}
                                                >
                                                    <FiEye className="admin-action-icon" />
                                                    <span>View</span>
                                                </button>

                                                <button
                                                    className={
                                                        service.isActive
                                                            ? "admin-deactivate-btn"
                                                            : "admin-activate-btn"
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(service)
                                                    }
                                                    disabled={
                                                        updatingId === service._id
                                                    }
                                                >
                                                    {updatingId === service._id
                                                        ? "Updating..."
                                                        : service.isActive
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

                {/* Pagination */}

                <div className="admin-users-pagination">

                    <span>
                        Page {pagination.currentPage} of {totalPages}
                    </span>

                    <div>
                        <button
                            onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                            }
                            disabled={loading || page <= 1}
                        >
                            <FiChevronLeft />
                            Previous
                        </button>

                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={loading || page >= totalPages}
                        >
                            Next
                            <FiChevronRight />
                        </button>
                    </div>

                </div>

            </div>

            {/* Service Details Modal */}

            {selectedService && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedService(null)}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Service details"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="admin-modal-header">
                            <h3>Service Details</h3>

                            <button
                                className="admin-modal-close"
                                onClick={() => setSelectedService(null)}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="admin-user-details">

                            <p>
                                <strong>Service Name:</strong>{" "}
                                {selectedService.name}
                            </p>

                            <p>
                                <strong>Description:</strong>{" "}
                                {selectedService.description || "-"}
                            </p>

                            <p>
                                <strong>Provider:</strong>{" "}
                                {selectedService.provider?.businessName || "-"}
                            </p>

                            <p>
                                <strong>Category:</strong>{" "}
                                {selectedService.category?.name || "-"}
                            </p>

                            <p>
                                <strong>Price:</strong>{" "}
                                ₹{selectedService.price}
                            </p>

                            <p>
                                <strong>Price Type:</strong>{" "}
                                {selectedService.priceType}
                            </p>

                            <p>
                                <strong>Location:</strong>{" "}
                                {[
                                    selectedService.provider?.area,
                                    selectedService.provider?.city
                                ]
                                    .filter(Boolean)
                                    .join(", ") || "-"}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedService.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </p>

                        </div>

                        <button
                            className="admin-refresh-btn"
                            onClick={() => setSelectedService(null)}
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}

export default ManageServices;
