import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    changePassword,
    getProfile,
    updateProfile
} from "../services/authService";
import MessagePage from "../components/MessagePage";

export default function Account() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() =>
        JSON.parse(localStorage.getItem("user") || "null")
    );
    const [name, setName] = useState(user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login", { replace: true });
            return;
        }

        getProfile()
            .then(response => {
                const profile = response.data.user;
                setUser(profile);
                setName(profile.name);
                localStorage.setItem("user", JSON.stringify(profile));
                window.dispatchEvent(new Event("fixnear-auth-change"));
            })
            .catch(requestError => {
                setError(
                    requestError.response?.data?.message ||
                    "Unable to load your profile."
                );
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const saveProfile = async event => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await updateProfile(name);
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            window.dispatchEvent(new Event("fixnear-auth-change"));
            setMessage("Profile updated successfully.");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to update your profile."
            );
        }
    };

    const savePassword = async event => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setMessage("Password changed successfully.");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to change your password."
            );
        }
    };

    if (!user) {
        return <MessagePage title="Login required" text="Please log in to manage your account." />;
    }

    if (loading) {
        return <main className="min-h-[600px] px-[8%] py-16">Loading your account...</main>;
    }

    return (
        <main className="min-h-[600px] bg-[#f7faf7] px-5 py-12 sm:px-10 lg:px-[8%]">
            <div className="mx-auto max-w-3xl">
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">
                    MY ACCOUNT
                </span>
                <h1 className="mt-3 text-3xl font-bold text-[#183d29]">Profile and settings</h1>

                {message && <p className="mt-5 rounded-lg bg-[#e0f4e5] px-4 py-3 text-sm text-[#247344]">{message}</p>}
                {error && <p className="mt-5 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">{error}</p>}

                <section className="mt-6 rounded-2xl border border-[#e1eae2] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#254b32]">Profile</h2>
                    <form onSubmit={saveProfile} className="mt-5 grid gap-4">
                        <label>
                            <span className="mb-1 block text-sm font-bold text-[#405a48]">Name</span>
                            <input value={name} onChange={event => setName(event.target.value)} required className="w-full rounded-lg border border-[#dce5dd] p-3" />
                        </label>
                        <label>
                            <span className="mb-1 block text-sm font-bold text-[#405a48]">Email</span>
                            <input value={user.email} disabled className="w-full rounded-lg border border-[#dce5dd] bg-gray-100 p-3" />
                        </label>
                        <button className="w-fit rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white" type="submit">
                            Save profile
                        </button>
                    </form>
                </section>

                <section className="mt-6 rounded-2xl border border-[#e1eae2] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#254b32]">Password settings</h2>
                    <form onSubmit={savePassword} className="mt-5 grid gap-4">
                        <input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required minLength="8" placeholder="Current password" className="w-full rounded-lg border border-[#dce5dd] p-3" />
                        <input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength="8" placeholder="New password (at least 8 characters)" className="w-full rounded-lg border border-[#dce5dd] p-3" />
                        <button className="w-fit rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white" type="submit">
                            Change password
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
