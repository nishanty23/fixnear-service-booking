import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/authService";

export default function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();

    const email =
        location.state?.email ||
        sessionStorage.getItem("resetEmail") ||
        "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await verifyOTP(email, otp);

            const resetToken = response.data.resetToken;

            if (!resetToken) {
                throw new Error("Reset token was not received");
            }

            navigate("/reset-password", {
                state: {
                    email,
                    resetToken
                }
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "OTP verification failed"
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
                    EMAIL VERIFICATION
                </span>

                <h2 className="mt-3 font-[Manrope,sans-serif] text-[28px] font-bold text-[#183d29]">
                    Verify OTP
                </h2>

                <p className="mt-2 text-[13px] text-[#78857b]">
                    Enter the 6-digit OTP sent to your registered email address.
                </p>

                {error && (
                    <p className="mt-4 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">
                        {error}
                    </p>
                )}

                <label
                    htmlFor="otp"
                    className="mt-6 block text-xs font-bold text-[#405a48]"
                >
                    Enter OTP
                </label>

                <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    value={otp}
                    onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 6-digit OTP"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 text-center text-xl tracking-[8px] outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <button
                    type="submit"
                    disabled={loading || !email}
                    className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#185e38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <Link
                    to="/forgot-password"
                    className="mt-6 block text-center text-sm font-semibold text-[#247c4b] hover:underline"
                >
                    ← Request a new OTP
                </Link>
            </form>
        </section>
    );
}

