import {
    FiSearch,
    FiX,
    FiEye,
    FiChevronLeft,
    FiChevronRight,
    FiCheck,
    FiXCircle
} from "react-icons/fi";
import { useCallback, useEffect, useState } from "react";
import {
    getAllProviderApplications,
    getProviderApplicationById,
    approveProvider,
    rejectProvider,
    getAllApprovedProviders,
    getApprovedProviderById,
    updateProviderStatus
} from "../services/providerService";
import "../styles/admin.css";

function ManageProviders() {
    const [activeTab, setActiveTab] = useState("applications");

    const [applications, setApplications] = useState([]);
    const [approvedProviders, setApprovedProviders] = useState([]);

    const [applicationStatus, setApplicationStatus] = useState("PENDING");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [applicationPage, setApplicationPage] = useState(1);
    const [approvedPage, setApprovedPage] = useState(1);

    const [applicationPagination, setApplicationPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProviders: 0
    });

    const [approvedPagination, setApprovedPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProviders: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingProvider, setRejectingProvider] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Fetch Provider Applications
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page: applicationPage,
                limit: 10
            };

            if (applicationStatus !== "ALL") {
                params.status = applicationStatus;
            }

            if (search) {
                params.search = search;
            }

            const response = await getAllProviderApplications(params);

            const data =
                response.applications ||
                response.providers ||
                response.providerApplications ||
                [];

            setApplications(data);

            setApplicationPagination({
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1,
                totalProviders: response.pagination?.totalApplications ?? data.length
            });
        } catch (err) {
            setError(err.message || "Failed to fetch provider applications.");
        } finally {
            setLoading(false);
        }
    }, [applicationStatus, applicationPage, search]);

    // Fetch Approved Providers
    const fetchApprovedProviders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllApprovedProviders({
                page: approvedPage,
                limit: 10,
                ...(search ? { search } : {})
            });

            const data =
                response.providers ||
                response.approvedProviders ||
                [];

            setApprovedProviders(data);

            setApprovedPagination(
                response.pagination || {
                    currentPage: approvedPage,
                    totalPages: 1,
                    totalProviders: data.length
                }
            );
        } catch (err) {
            setError(err.message || "Failed to fetch approved providers.");
        } finally {
            setLoading(false);
        }
    }, [approvedPage, search]);

    useEffect(() => {
        if (activeTab === "applications") {
            fetchApplications();
        } else {
            fetchApprovedProviders();
        }
    }, [activeTab, fetchApplications, fetchApprovedProviders]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
        setApplicationPage(1);
        setApprovedPage(1);
        setMessage("");
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setApplicationPage(1);
        setApprovedPage(1);
    };

    // View Provider Details
    const handleViewProvider = async (provider) => {
        try {
            setError("");

            const response =
                activeTab === "applications"
                    ? await getProviderApplicationById(provider._id)
                    : await getApprovedProviderById(provider._id);

            setSelectedProvider(
                response.provider ||
                response.application ||
                provider
            );
        } catch (err) {
            setError(err.message || "Failed to fetch provider details.");
        }
    };

    // Approve Provider
    const handleApprove = async (provider) => {
        const confirmed = window.confirm(
            `Are you sure you want to approve ${provider.businessName}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(provider._id);
            setError("");
            setMessage("");

            await approveProvider(provider._id);

            setMessage(
                `${provider.businessName} has been approved successfully.`
            );

            await fetchApplications();
        } catch (err) {
            setError(err.message || "Failed to approve provider.");
        } finally {
            setActionLoading(null);
        }
    };

    // Open Reject Modal
    const openRejectModal = (provider) => {
        setRejectingProvider(provider);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    // Reject Provider
    const handleReject = async (e) => {
        e.preventDefault();

        if (rejectionReason.trim().length < 5) {
            setError("Rejection reason must contain at least 5 characters.");
            return;
        }

        try {
            setActionLoading(rejectingProvider._id);
            setError("");
            setMessage("");

            await rejectProvider(
                rejectingProvider._id,
                rejectionReason.trim()
            );

            setMessage(
                `${rejectingProvider.businessName} has been rejected.`
            );

            setShowRejectModal(false);
            setRejectingProvider(null);
            setRejectionReason("");

            await fetchApplications();
        } catch (err) {
            setError(err.message || "Failed to reject provider.");
        } finally {
            setActionLoading(null);
        }
    };

    // Activate / Deactivate Approved Provider
    const handleProviderStatus = async (provider) => {
        const currentStatus = provider.user?.isActive !== false;
        const newStatus = !currentStatus;

        const confirmed = window.confirm(
            `Are you sure you want to ${newStatus ? "activate" : "deactivate"
            } ${provider.businessName}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(provider._id);
            setError("");
            setMessage("");

            await updateProviderStatus(provider._id, newStatus);

            setMessage(
                `${provider.businessName} account ${newStatus ? "activated" : "deactivated"
                } successfully.`
            );

            await fetchApprovedProviders();
        } catch (err) {
            setError(err.message || "Failed to update provider status.");
        } finally {
            setActionLoading(null);
        }
    };

    const currentPagination =
        activeTab === "applications"
            ? applicationPagination
            : approvedPagination;

    const currentPage =
        activeTab === "applications"
            ? applicationPage
            : approvedPage;

    const setCurrentPage =
        activeTab === "applications"
            ? setApplicationPage
            : setApprovedPage;

    const totalPages = Math.max(1, currentPagination.totalPages || 1);

    return (
        <div className="admin-providers-page">

            <div className="admin-dashboard-heading">
                <div>
                    <h2>Manage Providers</h2>
                    <p>Review applications and manage approved providers.</p>
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

            {/* Tabs */}

            <div className="admin-provider-tabs">
                <button
                    className={
                        activeTab === "applications" ? "active" : ""
                    }
                    onClick={() => {
                        setActiveTab("applications");
                        setMessage("");
                        setError("");
                    }}
                >
                    Provider Applications
                </button>

                <button
                    className={
                        activeTab === "approved" ? "active" : ""
                    }
                    onClick={() => {
                        setActiveTab("approved");
                        setMessage("");
                        setError("");
                    }}
                >
                    Approved Providers
                </button>
            </div>

            {/* Search and Filter */}

            <div className="admin-users-panel">

                <div className="admin-users-toolbar">

                    <form
                        className="admin-users-search"
                        onSubmit={handleSearch}
                    >
                        <input
                            type="search"
                            placeholder="Search business, city, area..."
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
                            <>
                                <FiX className="admin-action-icon" />
                                <span>Clear</span>
                            </>
                        </button>
                    </form>

                    {activeTab === "applications" && (
                        <select
                            className="admin-provider-filter"
                            value={applicationStatus}
                            onChange={(e) => {
                                setApplicationStatus(e.target.value);
                                setApplicationPage(1);
                            }}
                        >
                            <option value="ALL">All Applications</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    )}

                    <span className="admin-users-count">
                        Total: {currentPagination.totalProviders || 0}
                    </span>

                </div>

                {/* Applications Table */}

                <div className="admin-table-wrapper">

                    <table className="admin-users-table">

                        <thead>
                            <tr>
                                <th>Business Name</th>
                                <th>Owner</th>
                                <th>Email</th>
                                <th>Location</th>
                                <th>Approval Status</th>
                                {activeTab === "approved" && (
                                    <th>Account Status</th>
                                )}
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={
                                            activeTab === "approved" ? 7 : 6
                                        }
                                        className="admin-table-empty"
                                    >
                                        Loading providers...
                                    </td>
                                </tr>
                            ) : (
                                (activeTab === "applications"
                                    ? applications
                                    : approvedProviders
                                ).length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                activeTab === "approved" ? 7 : 6
                                            }
                                            className="admin-table-empty"
                                        >
                                            No providers found.
                                        </td>
                                    </tr>
                                ) : (
                                    (activeTab === "applications"
                                        ? applications
                                        : approvedProviders
                                    ).map((provider) => {

                                        const isActive =
                                            provider.user?.isActive !== false;

                                        return (
                                            <tr key={provider._id}>

                                                <td className="admin-user-name">
                                                    {provider.businessName}
                                                </td>

                                                <td>
                                                    {provider.user?.name || "-"}
                                                </td>

                                                <td>
                                                    {provider.user?.email || "-"}
                                                </td>

                                                <td>
                                                    {[
                                                        provider.area,
                                                        provider.city
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ") || "-"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`admin-status-badge ${provider.approvalStatus === "APPROVED"
                                                            ? "is-active"
                                                            : provider.approvalStatus === "REJECTED"
                                                                ? "is-inactive"
                                                                : "is-pending"
                                                            }`}
                                                    >
                                                        {provider.approvalStatus}
                                                    </span>
                                                </td>

                                                {activeTab === "approved" && (
                                                    <td>
                                                        <span
                                                            className={`admin-status-badge ${isActive
                                                                ? "is-active"
                                                                : "is-inactive"
                                                                }`}
                                                        >
                                                            {isActive
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>
                                                )}

                                                <td>
                                                    <div className="admin-table-actions">

                                                        <button
                                                            className="admin-view-btn"
                                                            onClick={() => handleViewProvider(provider)}
                                                        >
                                                            <FiEye className="admin-action-icon" />
                                                            <span>View</span>
                                                        </button>

                                                        {activeTab === "applications" &&
                                                            provider.approvalStatus === "PENDING" && (
                                                                <>
                                                                    <button
                                                                        className="admin-activate-btn"
                                                                        disabled={actionLoading === provider._id}
                                                                        onClick={() =>
                                                                            handleApprove(provider)
                                                                        }
                                                                    >
                                                                        {actionLoading === provider._id ? (
                                                                            "Please wait..."
                                                                        ) : (
                                                                            <>
                                                                                <FiCheck className="admin-action-icon" />
                                                                                <span>Approve</span>
                                                                            </>
                                                                        )}
                                                                    </button>

                                                                    <button
                                                                        className="admin-deactivate-btn"
                                                                        disabled={actionLoading === provider._id}
                                                                        onClick={() =>
                                                                            openRejectModal(provider)
                                                                        }
                                                                    >
                                                                        <FiXCircle className="admin-action-icon" />
                                                                        <span>Reject</span>
                                                                    </button>
                                                                </>
                                                            )}

                                                        {activeTab === "approved" && (
                                                            <button
                                                                className={
                                                                    isActive
                                                                        ? "admin-deactivate-btn"
                                                                        : "admin-activate-btn"
                                                                }
                                                                disabled={actionLoading === provider._id}
                                                                onClick={() =>
                                                                    handleProviderStatus(provider)
                                                                }
                                                            >
                                                                {actionLoading === provider._id
                                                                    ? "Updating..."
                                                                    : isActive
                                                                        ? "Deactivate"
                                                                        : "Activate"}
                                                            </button>
                                                        )}

                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )
                            )}

                        </tbody>
                    </table>

                </div>

                {/* Pagination */}

                <div className="admin-users-pagination">

                    <span>
                        Page {currentPage} of {totalPages}
                    </span>

                    <div>
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={loading || currentPage <= 1}
                        >
                            <FiChevronLeft />
                            Previous
                        </button>

                        <button
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={loading || currentPage >= totalPages}
                        >
                            Next
                            <FiChevronRight />
                        </button>
                    </div>

                </div>

            </div>

            {/* Provider Details Modal */}

            {selectedProvider && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedProvider(null)}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <h3>Provider Details</h3>

                            <button
                                className="admin-modal-close"
                                onClick={() => setSelectedProvider(null)}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="admin-user-details">

                            <p>
                                <strong>Business:</strong>{" "}
                                {selectedProvider.businessName}
                            </p>

                            <p>
                                <strong>Owner:</strong>{" "}
                                {selectedProvider.user?.name || "-"}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedProvider.user?.email || "-"}
                            </p>

                            <p>
                                <strong>Phone:</strong>{" "}
                                {selectedProvider.phone || "-"}
                            </p>

                            <p>
                                <strong>City:</strong>{" "}
                                {selectedProvider.city || "-"}
                            </p>

                            <p>
                                <strong>Area:</strong>{" "}
                                {selectedProvider.area || "-"}
                            </p>

                            <p>
                                <strong>Address:</strong>{" "}
                                {selectedProvider.address || "-"}
                            </p>

                            <p>
                                <strong>Experience:</strong>{" "}
                                {selectedProvider.experience ?? 0} years
                            </p>

                            <p>
                                <strong>Approval Status:</strong>{" "}
                                {selectedProvider.approvalStatus}
                            </p>

                            {selectedProvider.rejectionReason && (
                                <p>
                                    <strong>Rejection Reason:</strong>{" "}
                                    {selectedProvider.rejectionReason}
                                </p>
                            )}

                            {selectedProvider.user && (
                                <p>
                                    <strong>Account Status:</strong>{" "}
                                    {selectedProvider.user.isActive !== false
                                        ? "Active"
                                        : "Inactive"}
                                </p>
                            )}

                        </div>

                        <button
                            className="admin-refresh-btn"
                            onClick={() => setSelectedProvider(null)}
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

            {/* Reject Provider Modal */}

            {showRejectModal && rejectingProvider && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setShowRejectModal(false)}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <h3>Reject Provider Application</h3>

                            <button
                                className="admin-modal-close"
                                onClick={() => setShowRejectModal(false)}
                            >
                                <FiX />
                            </button>
                        </div>

                        <p>
                            Business: <strong>{rejectingProvider.businessName}</strong>
                        </p>

                        <form onSubmit={handleReject}>

                            <label className="admin-reject-label">
                                Rejection Reason
                            </label>

                            <textarea
                                className="admin-reject-textarea"
                                rows="4"
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                placeholder="Enter reason for rejection (minimum 5 characters)"
                                required
                            />

                            <div className="admin-reject-actions">
                                <button
                                    type="button"
                                    className="admin-clear-btn"
                                    onClick={() => setShowRejectModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-deactivate-btn"
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading !== null
                                        ? "Rejecting..."
                                        : "Confirm Reject"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default ManageProviders;
