import { useEffect, useState } from "react";
import {
    FiUsers,
    FiBriefcase,
    FiTool,
    FiCalendar
} from "react-icons/fi";

import { getDashboardStats } from "../services/dashboardService";

function AdminDashboard() {

    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getDashboardStats();

            setStatistics(response.statistics);

        } catch (err) {
            setError(
                err.message || "Failed to load dashboard statistics."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const statCards = statistics ? [
        {
            title: "Total Users",
            value: statistics.users.total,
            icon: FiUsers,
            color: "#2563eb"
        },
        {
            title: "Total Providers",
            value: statistics.providers.approved,
            icon: FiBriefcase,
            color: "#9333ea"
        },
        {
            title: "Total Services",
            value: statistics.services.total,
            icon: FiTool,
            color: "#d97706"
        },
        {
            title: "Total Bookings",
            value: statistics.bookings.total,
            icon: FiCalendar,
            color: "#0891b2"
        }
    ] : [];

    if (loading) {
        return <div className="admin-loading">Loading Dashboard...</div>;
    }

    if (error) {
        return (
            <div className="admin-error">
                <p>{error}</p>
                <button onClick={fetchDashboard}>
                    Retry
                </button>
            </div>
        );
    }

    if (!statistics) {
        return <p>No dashboard data available.</p>;
    }

    return (
        <div className="admin-dashboard">

            <div className="admin-dashboard-heading">
                <div>
                    <h2>Dashboard Overview</h2>
                    <p>Here is what's happening on FixNear today.</p>
                </div>
            </div>

            {/* Main Statistics */}

            <div className="admin-stats-grid">

                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div className="admin-stat-card" key={card.title}>

                            <div
                                className="admin-stat-icon"
                                style={{ backgroundColor: `${card.color}18` }}
                            >
                                <Icon />
                            </div>

                            <div>
                                <p>{card.title}</p>
                                <h3>{card.value}</h3>
                            </div>

                        </div>
                    );
                })}

            </div>

            {/* Provider Statistics */}

            <div className="admin-dashboard-section">

                <h3>Provider Overview</h3>

                <div className="admin-overview-grid">

                    <div className="admin-overview-card">
                        <span>Approved Providers</span>
                        <h2>{statistics.providers.approved}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>Pending Providers</span>
                        <h2>{statistics.providers.pending}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>Rejected Providers</span>
                        <h2>{statistics.providers.rejected}</h2>
                    </div>

                </div>

            </div>

            {/* Service Statistics */}

            <div className="admin-dashboard-section">

                <h3>Service Overview</h3>

                <div className="admin-overview-grid">

                    <div className="admin-overview-card">
                        <span>Active Services</span>
                        <h2>{statistics.services.active}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>Inactive Services</span>
                        <h2>{statistics.services.inactive}</h2>
                    </div>

                </div>

            </div>

            {/* Booking Statistics */}

            <div className="admin-dashboard-section">

                <h3>Booking Overview</h3>

                <div className="admin-overview-grid">

                    <div className="admin-overview-card">
                        <span>Pending</span>
                        <h2>{statistics.bookings.status.pending}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>Accepted</span>
                        <h2>{statistics.bookings.status.accepted}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>In Progress</span>
                        <h2>{statistics.bookings.status.inProgress}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>Completed</span>
                        <h2>{statistics.bookings.status.completed}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>Rejected</span>
                        <h2>{statistics.bookings.status.rejected}</h2>
                    </div>

                    <div className="admin-overview-card">
                        <span>Cancelled</span>
                        <h2>{statistics.bookings.status.cancelled}</h2>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;
