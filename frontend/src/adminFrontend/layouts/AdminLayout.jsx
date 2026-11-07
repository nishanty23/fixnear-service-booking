import { Navigate, Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminLayout() {
    const token = localStorage.getItem("adminToken");

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main-content">

                <AdminNavbar />

                <main className="admin-page-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;

