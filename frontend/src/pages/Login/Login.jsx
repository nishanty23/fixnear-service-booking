import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "./login";

export default function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        const form = new FormData(event.target);
        const result = await login(form.get("email"), form.get("password"));

        if (!result.success) {
            setError(result.message);
        } else {
            navigate("/");
        }
        setLoading(false);

    };

    return (
        <section className="flex min-h-[650px] items-center justify-center bg-[#eef5ef] px-5 py-16">
            <form
                className="w-full max-w-[440px] rounded-2xl border border-[#e2ebe3] bg-white p-7 shadow-[0_15px_45px_rgba(23,63,43,0.06)] sm:p-[38px]"
                onSubmit={submit}
            >
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">
                    WELCOME BACK
                </span>
                <h2 className="mt-3 font-[Manrope,sans-serif] text-[28px] font-bold text-[#183d29]">
                    Login to FixNear
                </h2>
                <p className="mt-2 text-[13px] text-[#78857b]">
                    Access your account and manage your services.
                </p>
                {error && <p role="alert" className="mt-4 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">{error}</p>}

                <label
                    className="mt-6 block text-xs font-bold text-[#405a48]"
                    htmlFor="email"
                >
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

                <label
                    className="mt-4 block text-xs font-bold text-[#405a48]"
                    htmlFor="password"
                >
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter password"
                    className="mt-2 w-full rounded-lg border border-[#dce5dd] bg-[#fcfdfc] p-3 outline-none transition focus:border-[#55a879] focus:ring-2 focus:ring-[#55a879]/20"
                />

                <div className="mt-3 flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-[#247c4b] hover:underline"
                    >
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#185e38]"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="mt-6 text-center text-[13px] text-[#78857b]">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-bold text-[#247c4b] hover:underline"
                    >
                        Create one
                    </Link>
                </p>
                <Link
                    to="/provider/login"
                    className="mt-4 block w-full rounded-lg border border-[#247c4b] px-5 py-3 text-center text-sm font-bold text-[#247c4b] transition hover:bg-[#eef5ef]"
                >
                    Provider registration / login
                </Link>
            </form>
        </section>
    );
}