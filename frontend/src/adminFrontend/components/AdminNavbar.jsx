import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { adminLogout } from "../services/adminAuthService";

function AdminNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        adminLogout();
        navigate("/admin/login");
    };

    return (
        <header className="admin-navbar">
            <div className="admin-navbar-title">
                <h3>Admin Dashboard</h3>
                <p>Welcome to FixNear Management Panel</p>
            </div>

            <div className="admin-navbar-profile">
                <div className="admin-profile-info">
                    <strong>Administrator</strong>
                    <span>ADMIN</span>
                </div>

                <div className="admin-profile-avatar">A</div>

                <button
                    className="admin-logout-btn"
                    onClick={handleLogout}
                >
                    <FiLogOut className="admin-logout-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
}

export default AdminNavbar;
