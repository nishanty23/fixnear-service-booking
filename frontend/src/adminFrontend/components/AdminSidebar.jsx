import { NavLink } from "react-router-dom";
import {
    FiGrid,
    FiUsers,
    FiBriefcase,
    FiTool,
    FiCalendar,
    FiTag,
    FiStar
} from "react-icons/fi";

function AdminSidebar() {
    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: FiGrid
        },
        {
            name: "Users",
            path: "/admin/users",
            icon: FiUsers
        },
        {
            name: "Providers",
            path: "/admin/providers",
            icon: FiBriefcase
        },
        {
            name: "Categories",
            path: "/admin/categories",
            icon: FiTag
        },
        {
            name: "Services",
            path: "/admin/services",
            icon: FiTool
        },
        {
            name: "Bookings",
            path: "/admin/bookings",
            icon: FiCalendar
        }, 
        {
            name: "Reviews",
            path: "/admin/reviews",
            icon: FiStar
        }
    ];

    return (
        <aside className="admin-sidebar">

            <div className="admin-sidebar-brand">
                <div className="admin-sidebar-logo">
                    <img
                        src="/assets/fixnear-icon.png"
                        alt="FixNear Logo"
                    />
                </div>

                <div>
                    <h2>FixNear</h2>
                    <span>ADMIN PANEL</span>
                </div>
            </div>

            <div className="admin-sidebar-menu">

                <p className="admin-menu-heading">MAIN MENU</p>

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `admin-menu-link ${isActive ? "active" : ""}`
                            }
                        >
                            <Icon className="admin-menu-icon" />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}

            </div>

            <div className="admin-sidebar-footer">
                <span>FixNear Admin</span>
                <small>Management Panel</small>
            </div>

        </aside>
    );
}

export default AdminSidebar;
