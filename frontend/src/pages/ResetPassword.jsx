import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const resetToken = location.state?.resetToken;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email, resetToken, newPassword);

            setSuccess("Password reset successfully!");

            sessionStorage.removeItem("resetEmail");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!email || !resetToken) {
        return (
            <section className="flex min-h-[650px] items-center justify-center bg-[#eef5ef] px-5 py-16">
                <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 text-center shadow-lg">
                    <h2 className="text-2xl font-bold text-[#183d29]">
                        Invalid Reset Session
                    </h2>

                    <p className="mt-3 text-sm text-[#78857b]">
                        Please verify your OTP again.
                    </p>

                    <Link
                        to="/forgot-password"
                        className="mt-6 inline-block font-bold text-[#247c4b] hover:underline"
                    >
                        Back to Forgot Password
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-[650px] items-center justify-center bg-[#eef5ef] px-5 py-16">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[440px] rounded-2xl border border-[#e2ebe3] bg-white p-7 shadow-[0_15px_45px_rgba(23,63,43,0.06)] sm:p-[38px]"
            >
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">
                    ACCOUNT SECURITY
                </span>

                <h2 className="mt-3 font-[Manrope,sans-serif] text-[28px] font-bold text-[#183d29]">
                    Reset Password
                </h2>

                <p className="mt-2 text-[13px] text-[#78857b]">
                    Create a new password for your FixNear account.
                </p>

                {error && (
                    <p className="mt-4 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="mt-4 rounded-lg bg-[#e7f6eb] px-4 py-3 text-sm text-[#247c4b]">
                        {success}
                    </p>
                )}

                <label
                    htmlFor="newPassword"
                    className="mt-6 block text-xs font-bold text-[#405a48]"
                >
                    New Password
                </label>

                <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <label
                    htmlFor="confirmPassword"
                    className="mt-4 block text-xs font-bold text-[#405a48]"
                >
                    Confirm New Password
                </label>

                <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#185e38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Updating Password..." : "Reset Password"}
                </button>

                <Link
                    to="/login"
                    className="mt-6 block text-center text-sm font-semibold text-[#247c4b] hover:underline"
                >
                    ← Back to Login
                </Link>
            </form>
        </section>
    );
}

