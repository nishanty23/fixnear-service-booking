import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";

const AppDrawer = memo(({ open, onClose }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("fixnear-auth-change"));
        onClose();
        navigate("/login", { replace: true });
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
        >
            <div className="w-80 p-6">

                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold">My Account</h2>

                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </div>

                <Divider />

                <div className="py-5">
                    <p className="text-lg font-semibold">
                        {user ? `Welcome, ${user.name}!` : "Welcome to FixNear!"}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                        Manage your account and bookings.
                    </p>
                </div>

                <Divider />

                <div className="flex flex-col gap-4 py-5">
                    <Link to="/account" onClick={onClose} className="text-left hover:text-[#247c4b]">
                        My Profile
                    </Link>

                    {user?.role === "USER" && (
                        <Link to="/bookings" onClick={onClose} className="text-left hover:text-[#247c4b]">
                            My Bookings
                        </Link>
                    )}

                    <Link to="/account" onClick={onClose} className="text-left hover:text-[#247c4b]">
                        Settings
                    </Link>

                    {user?.role === "SERVICE_PROVIDER" && (
                        <Link
                            to="/provider/dashboard"
                            onClick={onClose}
                            className="text-left hover:text-[#247c4b]"
                        >
                            Provider Dashboard
                        </Link>
                    )}

                    <Link
                        to="/about"
                        onClick={onClose}
                        className="text-left hover:text-[#247c4b]"
                    >
                        About Us
                    </Link>

                    <Link
                        to="/contact"
                        onClick={onClose}
                        className="text-left hover:text-[#247c4b]"
                    >
                        Contact Us
                    </Link>

                    <button
                        type="button"
                        className="text-left text-red-600"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

            </div>
        </Drawer>
    );
});

export default AppDrawer;