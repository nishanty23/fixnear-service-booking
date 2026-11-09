
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../services/authService";

export default function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        const form = new FormData(event.target);

        try {
            await registerUser(
                form.get("name"),
                form.get("email"),
                form.get("password")
            );

            alert("Registration Successful! Please login to continue.");

            navigate("/login");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-[650px] items-center justify-center bg-[#eef5ef] px-5 py-16">
            <form
                className="w-full max-w-[440px] rounded-2xl border border-[#e2ebe3] bg-white p-7 shadow-[0_15px_45px_rgba(23,63,43,0.06)] sm:p-[38px]"
                onSubmit={submit}
            >
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">
                    GET STARTED
                </span>

                <h2 className="mt-3 font-[Manrope,sans-serif] text-[28px] font-bold text-[#183d29]">
                    Create an account
                </h2>

                <p className="mt-2 text-[13px] text-[#78857b]">
                    Join FixNear and find reliable local professionals.
                </p>

                {error && (
                    <p role="alert" className="mt-4 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">
                        {error}
                    </p>
                )}

                <label className="mt-6 block text-xs font-bold text-[#405a48]" htmlFor="name">
                    Full name
                </label>

                <input
                    id="name"
                    name="name"
                    required
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <label className="mt-4 block text-xs font-bold text-[#405a48]" htmlFor="email">
                    Email address
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <label className="mt-4 block text-xs font-bold text-[#405a48]" htmlFor="password">
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    minLength="8"
                    required
                    placeholder="At least 8 characters"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#185e38] disabled:opacity-60"
                >
                    {loading ? "Creating account..." : "Create Account"}
                </button>

                <p className="mt-6 text-center text-[13px] text-[#78857b]">
                    Already registered?{" "}
                    <Link to="/login" className="font-bold text-[#247c4b] hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </section>
    );
}
