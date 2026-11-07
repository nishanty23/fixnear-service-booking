import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";

const AppDrawer = memo(({ open, onClose }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
                        Welcome to FixNear!
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                        Manage your account and bookings.
                    </p>
                </div>

                <Divider />

                <div className="flex flex-col gap-4 py-5">
                    <button className="text-left hover:text-[#247c4b]">
                        My Profile
                    </button>

                    <Link to="/bookings" onClick={onClose} className="text-left hover:text-[#247c4b]">
                        My Bookings
                    </Link>

                    <button className="text-left hover:text-[#247c4b]">
                        Settings
                    </button>

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