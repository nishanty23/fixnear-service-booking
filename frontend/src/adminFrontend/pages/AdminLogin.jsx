
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiLogIn,
    FiLoader
} from "react-icons/fi";

import { adminLogin } from "../services/adminAuthService";
import "../styles/admin.css";

function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            await adminLogin(formData);

            navigate("/admin/dashboard");

        } catch (err) {
            setError(
                err.message || "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-card">

                {/* Brand Section */}

                <div className="admin-login-brand">
                    <div className="admin-brand-logo">
                        <img src="/assets/fixnear-logo.png" alt="FixNear Logo" />
                    </div>
                    <p>ADMIN PANEL</p>
                </div>

                {/* Login Heading */}

                <div className="admin-login-heading">
                    <h2>Welcome Back!</h2>
                    <p>Login to access your admin dashboard.</p>
                </div>

                {/* Error Message */}

                {error && (
                    <div className="admin-login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Email Field */}

                    <div className="admin-form-group">
                        <label htmlFor="email">
                            Email Address
                        </label>

                        <div className="admin-login-input-wrapper">
                            <FiMail className="admin-login-input-icon" />

                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter admin email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}

                    <div className="admin-form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="admin-password-wrapper">
                            <FiLock className="admin-login-input-icon" />

                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="admin-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FiLoader className="admin-login-spinner" />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <FiLogIn />
                                <span>Login to Dashboard</span>
                            </>
                        )}
                    </button>

                </form>

                {/* Footer */}

                <div className="admin-login-footer">
                    <p>
                        Authorized Admin Access Only
                    </p>

                    <span>
                        © {new Date().getFullYear()} FixNear. All rights reserved.
                    </span>
                </div>

            </div>

        </div>
    );
}

export default AdminLogin;
