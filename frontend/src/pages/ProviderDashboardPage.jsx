import { useEffect, useState } from "react";
import MessagePage from "../components/MessagePage";
import ProviderDashboard from "./ProviderDashboard";
import {
    getProviderRequests,
    updateRequestStatus
} from "../services/requestService";
import { getCategories } from "../services/catalogService";
import { createService } from "../services/providerService";
import { validateImage } from "../utils/imageValidation";

export default function ProviderDashboardPage() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [requests, setRequests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
        return () => {
            if (previewImage.startsWith("blob:")) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    useEffect(() => {
        if (user?.role !== "SERVICE_PROVIDER") return;

        getProviderRequests()
            .then(response => setRequests(response.data.requests || []))
            .catch(requestError => {
                setError(
                    requestError.response?.data?.message ||
                    "Unable to load provider requests."
                );
            });

        getCategories()
            .then(response => setCategories(response.data.categories || []))
            .catch(() => setError("Unable to load service categories."));
    }, [user?.role]);

    if (!user) {
        return <MessagePage title="Login required" text="Please log in as a provider." />;
    }

    if (user.role !== "SERVICE_PROVIDER") {
        return <MessagePage title="Access denied" text="This page is only for service providers." />;
    }

    if (error) {
        return <MessagePage title="Unable to load dashboard" text={error} />;
    }

    const updateStatus = async (id, status) => {
        const response = await updateRequestStatus(id, status);

        setRequests(current =>
            current.map(request =>
                request._id === id ? response.data.request : request
            )
        );
    };

    const handleCreateService = async event => {
        event.preventDefault();

        const formElement = event.currentTarget;
        const formData = new FormData(formElement);

        setLoading(true);
        setMessage("");

        if (!selectedImage) {
            setMessage("Service image is required.");
            setLoading(false);
            return;
        }

        try {
            const response = await createService(formData);

            setServices(current => [
                response.data.service,
                ...current
            ]);

            setMessage("Service added successfully!");
            formElement.reset();
            setSelectedImage(null);
            setPreviewImage("");
        } catch (requestError) {
            setMessage(
                requestError.response?.data?.message ||
                "Unable to add service."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        const validationError = validateImage(file);

        if (validationError) {
            event.target.value = "";
            setSelectedImage(null);
            setPreviewImage("");
            setMessage(validationError);
            return;
        }

        if (previewImage.startsWith("blob:")) {
            URL.revokeObjectURL(previewImage);
        }

        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file));
        setMessage("");
    };

    return (
        <section className="mx-auto max-w-6xl px-5 py-10">
            <div className="mb-8">
                <span className="text-sm font-bold tracking-widest text-green-700">
                    PROFESSIONAL AREA
                </span>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                    Provider Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                    Manage your services and customer requests.
                </p>
            </div>

            {/* ADD SERVICE */}
            <div className="mb-10 rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-bold">
                    Add a New Service
                </h2>

                <form onSubmit={handleCreateService} className="grid gap-4 sm:grid-cols-2">

                    <input
                        name="name"
                        required
                        placeholder="Service name (e.g. AC Repair)"
                        className="rounded-lg border p-3"
                    />

                    <select
                        name="category"
                        required
                        defaultValue=""
                        className="rounded-lg border p-3"
                    >
                        <option value="" disabled>
                            Select category
                        </option>

                        {categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <textarea
                        name="description"
                        required
                        placeholder="Describe the service you provide"
                        className="rounded-lg border p-3 sm:col-span-2"
                        rows="3"
                    />

                    <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="Price in INR"
                        className="rounded-lg border p-3"
                    />

                    <select
                        name="priceType"
                        defaultValue="FIXED"
                        className="rounded-lg border p-3"
                    >
                        <option value="FIXED">Fixed Price</option>
                        <option value="HOURLY">Hourly</option>
                        <option value="STARTING_FROM">Starting From</option>
                    </select>

                    <label className="flex flex-col gap-2 sm:col-span-2">
                        <span className="text-sm font-semibold text-gray-700">
                            Service image *
                        </span>
                        <input
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            required
                            className="rounded-lg border p-3"
                        />
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Service preview"
                                className="h-40 w-full rounded-lg object-cover sm:w-64"
                            />
                        )}
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-green-700 px-5 py-3 font-bold text-white disabled:bg-gray-400 sm:col-span-2"
                    >
                        {loading ? "Adding..." : "Add Service"}
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-sm font-semibold text-green-700">
                        {message}
                    </p>
                )}
            </div>

            {/* SERVICES ADDED IN THIS SESSION */}
            <div className="mb-10">
                <h2 className="mb-4 text-xl font-bold">Recently Added Services</h2>

                {services.length === 0 ? (
                    <p className="text-gray-500">
                        No services added during this session yet.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {services.map(service => (
                            <div key={service._id} className="rounded-xl border bg-white p-5">
                                {service.image && (
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="mb-4 h-40 w-full rounded-lg object-cover"
                                    />
                                )}
                                <h3 className="font-bold">{service.name}</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {service.description}
                                </p>
                                <p className="mt-3 font-bold text-green-700">
                                    INR {service.price} · {service.priceType}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* EXISTING CUSTOMER REQUESTS */}
            <ProviderDashboard
                user={user}
                requests={requests}
                updateStatus={updateStatus}
            />
        </section>
    );
}