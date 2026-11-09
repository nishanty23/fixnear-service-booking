import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await forgotPassword(email);

            sessionStorage.setItem("resetEmail", email);

            setSuccess("If an account exists with this email, an OTP will be sent.");

            navigate("/verify-otp", {
                state: { email }
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-[650px] items-center justify-center bg-[#eef5ef] px-5 py-16">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[440px] rounded-2xl border border-[#e2ebe3] bg-white p-7 shadow-[0_15px_45px_rgba(23,63,43,0.06)] sm:p-[38px]"
            >
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">
                    ACCOUNT RECOVERY
                </span>

                <h2 className="mt-3 font-[Manrope,sans-serif] text-[28px] font-bold text-[#183d29]">
                    Forgot Password?
                </h2>

                <p className="mt-2 text-[13px] text-[#78857b]">
                    Enter your registered email address. We will send you an OTP to reset your password.
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
                    htmlFor="email"
                    className="mt-6 block text-xs font-bold text-[#405a48]"
                >
                    Email address
                </label>

                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#185e38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Sending OTP..." : "Send OTP"}
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

