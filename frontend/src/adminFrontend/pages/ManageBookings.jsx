import {
    FiSearch,
    FiX,
    FiEye,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import { useCallback, useEffect, useState } from "react";
import { getAllBookings, getBookingById } from "../services/bookingService";
import "../styles/admin.css";

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [cityInput, setCityInput] = useState("");
    const [city, setCity] = useState("");
    const [areaInput, setAreaInput] = useState("");
    const [area, setArea] = useState("");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBookings: 0,
        pageLimit: 10
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Fetch bookings from backend
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: 10
            };

            if (search) params.search = search;
            if (statusFilter !== "ALL") params.status = statusFilter;
            if (city) params.city = city;
            if (area) params.area = area;

            const response = await getAllBookings(params);

            setBookings(response.bookings || []);

            setPagination({
                currentPage: response.pagination?.currentPage || 1,
                totalPages: response.pagination?.totalPages || 1,
                totalBookings: response.pagination?.totalBookings ?? 0,
                pageLimit: response.pagination?.pageLimit || 10
            });
        } catch (err) {
            setError(err.message || "Failed to fetch bookings.");
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter, city, area]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
        setCity(cityInput.trim());
        setArea(areaInput.trim());
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchInput("");
        setSearch("");
        setCityInput("");
        setCity("");
        setAreaInput("");
        setArea("");
        setStatusFilter("ALL");
        setPage(1);
    };

    // View single booking details
    const handleViewBooking = async (id) => {
        try {
            setDetailsLoading(true);
            setError("");

            const response = await getBookingById(id);
            setSelectedBooking(response.booking);
        } catch (err) {
            setError(err.message || "Failed to fetch booking details.");
        } finally {
            setDetailsLoading(false);
        }
    };

    // Color-coded badge classes for booking statuses
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "COMPLETED":
                return "is-active";
            case "IN_PROGRESS":
            case "ACCEPTED":
                return "status-inprogress";
            case "PENDING":
                return "is-pending";
            case "CANCELLED":
            case "REJECTED":
                return "is-inactive";
            default:
                return "role-badge";
        }
    };

    const totalPages = Math.max(1, pagination.totalPages);

    return (
        <div className="admin-bookings-page">
            {/* 1 & 2. Page Heading and Subtitle */}
            <div className="admin-dashboard-heading">
                <div>
                    <h2>Manage Bookings</h2>
                    <p>Monitor and view all customer bookings on FixNear.</p>
                </div>
            </div>

            {error && (
                <div className="admin-error" role="alert">
                    {error}
                </div>
            )}

            <div className="admin-users-panel">
                {/* 4, 5, 6, 7 & 8. Search, Filters, and Total Count Toolbar */}
                <div className="admin-users-toolbar">
                    <form className="admin-users-search" onSubmit={handleSearch}>
                        <input
                            type="search"
                            placeholder="Search customer, provider, service..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />

                        {/* 6. City filter input */}
                        <input
                            type="search"
                            placeholder="Filter by city..."
                            value={cityInput}
                            style={{ minWidth: "150px" }}
                            onChange={(e) => setCityInput(e.target.value)}
                        />

                        {/* 7. Area filter input */}
                        <input
                            type="search"
                            placeholder="Filter by area..."
                            value={areaInput}
                            style={{ minWidth: "150px" }}
                            onChange={(e) => setAreaInput(e.target.value)}
                        />

                        <button type="submit">
                            <FiSearch className="admin-action-icon" />
                            <span>Search</span>
                        </button>

                        <button
                            type="button"
                            className="admin-clear-btn"
                            onClick={handleClearFilters}
                        >
                            <FiX className="admin-action-icon" />
                            <span>Clear</span>
                        </button>
                    </form>

                    {/* 5. Booking Status filter */}
                    <select
                        className="admin-provider-filter"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="ALL">All Bookings</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    {/* 8. Total Bookings count */}
                    <span className="admin-users-count">
                        Total Bookings: {pagination.totalBookings}
                    </span>
                </div>

                {/* 9. Responsive Bookings Table */}
                <div className="admin-table-wrapper">
                    <table className="admin-users-table">
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Customer Email</th>
                                <th>Provider Name</th>
                                <th>Service Name</th>
                                <th>City</th>
                                <th>Scheduled Date</th>
                                <th>Total Price</th>
                                <th>Booking Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* 13. Loading State */}
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="admin-table-empty">
                                        Loading bookings...
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                /* 13. Empty State */
                                <tr>
                                    <td colSpan="9" className="admin-table-empty">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td className="admin-user-name">
                                            {booking.user?.name || "-"}
                                        </td>
                                        <td>{booking.user?.email || "-"}</td>
                                        <td>
                                            {booking.provider?.businessName || "-"}
                                        </td>
                                        <td>{booking.service?.name || "-"}</td>
                                        <td>
                                            {booking.city || booking.provider?.city || "-"}
                                        </td>
                                        <td>
                                            {booking.scheduledDate
                                                ? new Date(booking.scheduledDate).toLocaleDateString("en-IN")
                                                : "-"}
                                        </td>
                                        <td>
                                            <strong>₹{booking.totalPrice ?? 0}</strong>
                                        </td>
                                        <td>
                                            <span
                                                className={`admin-status-badge ${getStatusBadgeClass(
                                                    booking.status
                                                )}`}
                                            >
                                                {booking.status?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td>
                                            <div
                                                className="admin-table-actions"
                                                style={{ justifyContent: "flex-end" }}
                                            >
                                                {/* 10. View button */}
                                                <button
                                                    className="admin-view-btn"
                                                    onClick={() => handleViewBooking(booking._id)}
                                                    disabled={detailsLoading}
                                                >
                                                    <FiEye className="admin-action-icon" />
                                                    <span>View</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 12. Pagination (Previous & Next) */}
                <div className="admin-users-pagination">
                    <span>
                        Page {pagination.currentPage} of {totalPages}
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
                            disabled={loading || page >= totalPages}
                        >
                            Next
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* 11. Complete Booking Details Modal */}
            {selectedBooking && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Booking details"
                        style={{ maxWidth: "560px" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <h3>Booking Details</h3>
                            <button
                                className="admin-modal-close"
                                onClick={() => setSelectedBooking(null)}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="admin-user-details" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                            <p>
                                <strong>Booking ID:</strong>{" "}
                                <code>{selectedBooking._id}</code>
                            </p>
                            <p>
                                <strong>Customer Name:</strong>{" "}
                                {selectedBooking.user?.name || "-"}
                            </p>
                            <p>
                                <strong>Customer Email:</strong>{" "}
                                {selectedBooking.user?.email || "-"}
                            </p>
                            <p>
                                <strong>Provider Business Name:</strong>{" "}
                                {selectedBooking.provider?.businessName || "-"}
                            </p>
                            <p>
                                <strong>Provider Owner Name:</strong>{" "}
                                {selectedBooking.provider?.user?.name || "-"}
                            </p>
                            <p>
                                <strong>Service Name:</strong>{" "}
                                {selectedBooking.service?.name || "-"}
                            </p>
                            <p>
                                <strong>Service Price:</strong>{" "}
                                ₹{selectedBooking.service?.price ?? "-"}
                            </p>
                            <p>
                                <strong>Description:</strong>{" "}
                                {selectedBooking.description || "-"}
                            </p>
                            <p>
                                <strong>Address:</strong>{" "}
                                {selectedBooking.address || "-"}
                            </p>
                            <p>
                                <strong>City:</strong>{" "}
                                {selectedBooking.city || "-"}
                            </p>
                            <p>
                                <strong>Area:</strong>{" "}
                                {selectedBooking.area || "-"}
                            </p>
                            <p>
                                <strong>Pincode:</strong>{" "}
                                {selectedBooking.pincode || "-"}
                            </p>
                            <p>
                                <strong>Scheduled Date:</strong>{" "}
                                {selectedBooking.scheduledDate
                                    ? new Date(selectedBooking.scheduledDate).toLocaleDateString("en-IN")
                                    : "-"}
                            </p>
                            <p>
                                <strong>Total Price:</strong>{" "}
                                <strong>₹{selectedBooking.totalPrice ?? 0}</strong>
                            </p>
                            <p>
                                <strong>Booking Status:</strong>{" "}
                                <span
                                    className={`admin-status-badge ${getStatusBadgeClass(
                                        selectedBooking.status
                                    )}`}
                                >
                                    {selectedBooking.status?.replace("_", " ")}
                                </span>
                            </p>
                            <p>
                                <strong>Created Date:</strong>{" "}
                                {selectedBooking.createdAt
                                    ? new Date(selectedBooking.createdAt).toLocaleString("en-IN")
                                    : "-"}
                            </p>
                            <p>
                                <strong>Hidden From History:</strong>{" "}
                                <span
                                    className={`admin-status-badge ${
                                        selectedBooking.hiddenFromHistory
                                            ? "is-inactive"
                                            : "is-active"
                                    }`}
                                >
                                    {selectedBooking.hiddenFromHistory ? "Yes" : "No"}
                                </span>
                            </p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
                            <button
                                className="admin-refresh-btn"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageBookings;
