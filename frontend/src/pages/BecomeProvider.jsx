import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerProvider } from "../services/authService";
import { getCategories } from "../services/catalogService";
import LocationAutocomplete from "../components/AppLayout/LocationAutoComplete/LocationAutoComplete.jsx";

const defaultLocation = {
    address: "Kharghar, Navi Mumbai, Maharashtra",
    latitude: 19.0473,
    longitude: 73.0699
};

export default function BecomeProvider() {
    const navigate = useNavigate();
    const [location, setLocation] = useState(defaultLocation);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data.categories || []);
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                    "Unable to load service categories."
                );
            }
        };

        loadCategories();
    }, []);

    const submit = async event => {
        event.preventDefault();
        setError("");
        setLoading(true);

        const form = new FormData(event.currentTarget);

        try {
            await registerProvider(
                form.get("name"),
                form.get("email"),
                form.get("password"),
                {
                    businessName: form.get("businessName"),
                    category: form.get("category"),
                    description: form.get("description"),
                    phone: form.get("phone"),
                    city: form.get("city"),
                    area: form.get("area"),
                    address: form.get("address"),
                    pincode: form.get("pincode"),
                    experience: Number(form.get("experience") || 0),
                    location: {
                        type: "Point",
                        coordinates: [
                            location.longitude,
                            location.latitude
                        ]
                    }
                }
            );

            alert(
                "Registration Successful! Please wait for Admin approval before logging in."
            );

            navigate("/provider/login", { replace: true });

        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to register as a provider."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[600px] bg-[#f7faf7] px-5 py-12 sm:px-10 lg:px-[8%]">
            <div className="mx-auto max-w-3xl rounded-2xl border border-[#e1eae2] bg-white p-6 shadow-sm sm:p-8">
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">
                    PROVIDER REGISTRATION
                </span>

                <h1 className="mt-3 text-3xl font-bold text-[#183d29]">
                    Register as a provider
                </h1>

                <p className="mt-2 text-sm text-[#718075]">
                    Create your provider account and submit your business details.
                </p>

                {error && (
                    <p role="alert" className="mt-5 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">
                        {error}
                    </p>
                )}

                <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                    <input name="name" required placeholder="Full name" className="rounded-lg border border-[#dce5dd] p-3" />

                    <input name="businessName" required placeholder="Business name" className="rounded-lg border border-[#dce5dd] p-3" />

                    <input name="email" type="email" required placeholder="Email address" className="rounded-lg border border-[#dce5dd] p-3" />

                    <input name="password" type="password" minLength="8" required placeholder="Password (8+ characters)" className="rounded-lg border border-[#dce5dd] p-3" />

                    <select name="category" required defaultValue="" className="rounded-lg border border-[#dce5dd] bg-white p-3">
                        <option value="" disabled>Select your service category</option>
                        {categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <input name="phone" required placeholder="Phone number" className="rounded-lg border border-[#dce5dd] p-3" />

                    <textarea name="description" required placeholder="Describe your services" className="rounded-lg border border-[#dce5dd] p-3 sm:col-span-2" rows="3" />

                    <input name="city" required placeholder="City" className="rounded-lg border border-[#dce5dd] p-3" />

                    <input name="area" required placeholder="Area" className="rounded-lg border border-[#dce5dd] p-3" />

                    <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-[#405a48]" htmlFor="provider-location">
                            Service location
                        </label>

                        <LocationAutocomplete
                            location={location.address}
                            onLocationSelect={selected => setLocation({
                                address: selected.address,
                                latitude: selected.lat,
                                longitude: selected.lng
                            })}
                        />
                    </div>

                    <input name="address" placeholder="Address" className="rounded-lg border border-[#dce5dd] p-3 sm:col-span-2" />

                    <input name="pincode" required pattern="[0-9]{6}" maxLength="6" placeholder="6-digit pincode" className="rounded-lg border border-[#dce5dd] p-3" />

                    <input name="experience" type="number" min="0" placeholder="Years of experience" className="rounded-lg border border-[#dce5dd] p-3" />

                    <button
                        disabled={loading}
                        className="rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white disabled:bg-gray-400 sm:col-span-2"
                        type="submit"
                    >
                        {loading ? "Registering..." : "Register provider"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => navigate("/provider/login")}
                    className="mt-4 text-sm font-bold text-[#247c4b] hover:underline"
                >
                    Already registered? Log in
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-4 block w-full rounded-lg border border-[#247c4b] px-5 py-3 text-sm font-bold text-[#247c4b] transition hover:bg-[#eef5ef]"
                >
                    Back to user login
                </button>
            </div>
        </main>
    );
}
