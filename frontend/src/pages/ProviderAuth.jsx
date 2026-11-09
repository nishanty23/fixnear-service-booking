import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginProvider } from "../services/authService";

export default function ProviderAuth({ mode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = mode === "login";
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const registrationMessage = location.state?.message || "";

    const submit = async event => {
        event.preventDefault();
        setError("");
        setLoading(true);
        const form = new FormData(event.currentTarget);

        try {
            const loginResponse = await loginProvider(
                form.get("email"),
                form.get("password")
            );

            localStorage.setItem("token", loginResponse.data.token);
            localStorage.setItem("user", JSON.stringify(loginResponse.data.user));
            window.dispatchEvent(new Event("fixnear-auth-change"));
            navigate("/provider/dashboard", { replace: true });
        } catch (requestError) {
            const message = requestError.response?.data?.message;

            setError(
                message ||
                `Unable to ${isLogin ? "log in" : "register"} as a provider.`
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
                    PROVIDER PORTAL
                </span>
                <h2 className="mt-3 text-[28px] font-bold text-[#183d29]">
                    {isLogin ? "Provider login" : "Register as a provider"}
                </h2>
                <p className="mt-2 text-[13px] text-[#78857b]">
                    {isLogin
                        ? "Manage your services and customer requests."
                        : "Create a separate service provider account."}
                </p>
                {error && <p role="alert" className="mt-4 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">{error}</p>}
                {registrationMessage && <p role="status" className="mt-4 rounded-lg bg-[#e0f4e5] px-4 py-3 text-sm text-[#247344]">{registrationMessage}</p>}

                {!isLogin && (
                    <input name="name" required placeholder="Full name" className="mt-6 w-full rounded-lg border border-[#dce5dd] p-3" />
                )}
                <input name="email" type="email" required placeholder="Email address" className="mt-4 w-full rounded-lg border border-[#dce5dd] p-3" />
                <input name="password" type="password" minLength="8" required placeholder="At least 8 characters" className="mt-4 w-full rounded-lg border border-[#dce5dd] p-3" />
                {isLogin && (
                    <div className="mt-3 flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-sm font-semibold text-[#247c4b] hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                )}
                <button disabled={loading} className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white disabled:bg-gray-400">
                    {loading ? "Please wait..." : isLogin ? "Login" : "Create provider account"}
                </button>
                <p className="mt-6 text-center text-[13px] text-[#78857b]">
                    Need a provider account?{" "}
                    <Link
                        to="/provider/register"
                        className="font-bold text-[#247c4b] hover:underline"
                    >
                        Register
                    </Link>
                </p>
                <Link
                    to="/login"
                    className="mt-4 block w-full rounded-lg border border-[#247c4b] px-5 py-3 text-center text-sm font-bold text-[#247c4b] transition hover:bg-[#eef5ef]"
                >
                    Back to user login
                </Link>
            </form>
        </section>
    );
}
