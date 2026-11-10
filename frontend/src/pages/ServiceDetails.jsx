import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    getProviderReviews,
    getServiceById
} from "../services/catalogService";
import { createRequest } from "../services/requestService";

const formatPriceType = (priceType) => {
    switch (priceType) {
        case "HOURLY":
            return "per hour";
        case "STARTING_FROM":
            return "starting from";
        default:
            return "per service";
    }
};

const getMinimumDateTime = () => {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60 * 1000)
        .toISOString()
        .slice(0, 16);
};

export default function ServiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookingOpen, setBookingOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [bookingError, setBookingError] = useState("");
    const [minimumDateTime] = useState(getMinimumDateTime);

    const provider = service?.provider;
    const user = useMemo(
        () => JSON.parse(localStorage.getItem("user") || "null"),
        []
    );

    useEffect(() => {
        let cancelled = false;

        const loadService = async () => {
            setLoading(true);
            setError("");

            try {
                const serviceResponse = await getServiceById(id);
                const loadedService = serviceResponse.data.service;

                if (cancelled) return;
                setService(loadedService);

                if (loadedService.provider?._id) {
                    try {
                        const reviewResponse = await getProviderReviews(
                            loadedService.provider._id
                        );

                        if (!cancelled) {
                            setReviews(reviewResponse.data.reviews || []);
                            setAverageRating(
                                reviewResponse.data.averageRating ||
                                loadedService.provider.averageRating ||
                                0
                            );
                        }
                    } catch (reviewError) {
                        if (!cancelled) {
                            setError(
                                reviewError.response?.data?.message ||
                                "Unable to load provider reviews."
                            );
                        }
                    }
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load service details."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadService();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const openBooking = () => {
        if (!user || user.role !== "USER") {
            navigate("/login", {
                state: { from: `/services/${id}` }
            });
            return;
        }

        setBookingError("");
        setMessage("");
        setBookingOpen(true);
    };

    const submitBooking = async (event) => {
        event.preventDefault();
        setBookingLoading(true);
        setBookingError("");
        setMessage("");

        const form = new FormData(event.currentTarget);

        try {
            await createRequest(id, {
                description: form.get("description"),
                address: form.get("address"),
                city: form.get("city"),
                area: form.get("area"),
                pincode: form.get("pincode"),
                scheduledDate: form.get("scheduledDate")
            });

            setMessage("Your service request has been submitted successfully.");
            setBookingOpen(false);
            event.currentTarget.reset();
        } catch (requestError) {
            setBookingError(
                requestError.response?.data?.message ||
                "Unable to submit your booking."
            );
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-[600px] bg-[#f7faf7] px-5 py-16 text-[#75847a] sm:px-10 lg:px-[8%]">
                Loading service details...
            </main>
        );
    }

    if (error || !service) {
        return (
            <main className="min-h-[600px] bg-[#f7faf7] px-5 py-16 sm:px-10 lg:px-[8%]">
                <p className="text-red-600">{error || "Service not found."}</p>
                <Link
                    to="/"
                    className="mt-5 inline-block font-bold text-[#247c4b] hover:underline"
                >
                    Back to home
                </Link>
            </main>
        );
    }

    const coordinates = provider?.location?.coordinates;
    const mapUrl = coordinates?.length === 2
        ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
        : null;

    return (
        <main className="min-h-[600px] bg-[#f7faf7] px-5 py-12 sm:px-10 lg:px-[8%]">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/"
                    className="text-sm font-bold text-[#247c4b] hover:underline"
                >
                    ← Back to services
                </Link>

                {message && (
                    <p className="mt-5 rounded-lg bg-[#e0f4e5] px-4 py-3 text-sm text-[#247344]">
                        {message}
                    </p>
                )}

                <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="rounded-2xl border border-[#e1eae2] bg-white p-6 shadow-sm sm:p-8">
                        <img
                            src={service.image || "/assets/fixnear-icon.png"}
                            alt={service.name}
                            className="mb-6 h-64 w-full rounded-xl object-cover"
                            onError={(event) => {
                                event.currentTarget.src = "/assets/fixnear-icon.png";
                            }}
                        />
                        <span className="text-xs font-extrabold tracking-[2px] text-[#348356]">
                            {service.category?.name || "HOME SERVICE"}
                        </span>
                        <h1 className="mt-3 text-3xl font-bold text-[#183d29] sm:text-4xl">
                            {service.name}
                        </h1>
                        <p className="mt-5 whitespace-pre-line leading-7 text-[#59695d]">
                            {service.description}
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[#edf2ed] pt-6">
                            <strong className="text-2xl text-[#247c4b]">
                                ₹{service.price}
                            </strong>
                            <span className="text-sm text-[#718075]">
                                {formatPriceType(service.priceType)}
                            </span>
                            <span className="rounded-full bg-[#e0f4e5] px-3 py-1 text-xs font-bold text-[#247344]">
                                {provider?.availability ? "Available" : "Currently unavailable"}
                            </span>
                        </div>
                    </div>

                    <aside className="rounded-2xl border border-[#e1eae2] bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-[#254b32]">
                            {provider?.businessName || "Service Provider"}
                        </h2>
                        <p className="mt-2 text-sm text-[#718075]">
                            {provider?.description || "Trusted local professional"}
                        </p>

                        <div className="mt-5 space-y-3 text-sm text-[#59695d]">
                            <p>⭐ {averageRating || "New"} average rating</p>
                            <p>👤 {provider?.user?.name || "Verified professional"}</p>
                            {provider?.experience !== undefined && (
                                <p>🛠 {provider.experience} years of experience</p>
                            )}
                            <p>
                                📍 {provider?.area}, {provider?.city}
                                {provider?.pincode ? ` - ${provider.pincode}` : ""}
                            </p>
                            {provider?.address && <p>{provider.address}</p>}
                            {provider?.phone && <p>☎ {provider.phone}</p>}
                        </div>

                        {mapUrl && (
                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 inline-block text-sm font-bold text-[#247c4b] hover:underline"
                            >
                                View provider location
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={openBooking}
                            disabled={!provider?.availability}
                            className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#185e38] disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {provider?.availability ? "Book this service" : "Currently unavailable"}
                        </button>
                    </aside>
                </section>

                <section className="mt-6 rounded-2xl border border-[#e1eae2] bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <span className="text-xs font-extrabold tracking-[2px] text-[#348356]">
                                CUSTOMER FEEDBACK
                            </span>
                            <h2 className="mt-2 text-2xl font-bold text-[#183d29]">
                                Ratings and reviews
                            </h2>
                        </div>
                        <strong className="text-xl text-[#247c4b]">
                            ⭐ {averageRating || "New"}
                        </strong>
                    </div>

                    {reviews.length === 0 ? (
                        <p className="mt-6 text-sm text-[#718075]">
                            No reviews yet. Be the first to share your experience.
                        </p>
                    ) : (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {reviews.map(review => (
                                <article
                                    key={review._id}
                                    className="rounded-xl bg-[#f7faf7] p-4"
                                >
                                    <div className="flex justify-between gap-3">
                                        <strong className="text-[#254b32]">
                                            {review.user?.name || "Customer"}
                                        </strong>
                                        <span>⭐ {review.rating}/5</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-[#59695d]">
                                        {review.comment}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {bookingOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
                        <form
                            onSubmit={submitBooking}
                            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#183d29]">
                                        Book {service.name}
                                    </h2>
                                    <p className="mt-1 text-sm text-[#718075]">
                                        Tell the provider what you need and choose a convenient time.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBookingOpen(false)}
                                    className="text-2xl text-gray-500"
                                    aria-label="Close booking form"
                                >
                                    ×
                                </button>
                            </div>

                            {bookingError && (
                                <p className="mt-4 rounded-lg bg-[#fde7e7] px-4 py-3 text-sm text-[#a23a3a]">
                                    {bookingError}
                                </p>
                            )}

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <label className="sm:col-span-2">
                                    <span className="mb-1 block text-sm font-bold text-[#405a48]">
                                        Describe the work
                                    </span>
                                    <textarea
                                        name="description"
                                        required
                                        rows="3"
                                        className="w-full rounded-lg border border-[#dce5dd] p-3"
                                        placeholder="Describe what needs to be fixed..."
                                    />
                                </label>
                                <label className="sm:col-span-2">
                                    <span className="mb-1 block text-sm font-bold text-[#405a48]">
                                        Address
                                    </span>
                                    <input
                                        name="address"
                                        required
                                        className="w-full rounded-lg border border-[#dce5dd] p-3"
                                        placeholder="House / Street address"
                                    />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-bold text-[#405a48]">City</span>
                                    <input name="city" required className="w-full rounded-lg border border-[#dce5dd] p-3" />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-bold text-[#405a48]">Area</span>
                                    <input name="area" required className="w-full rounded-lg border border-[#dce5dd] p-3" />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-bold text-[#405a48]">Pincode</span>
                                    <input name="pincode" required pattern="[0-9]{6}" maxLength="6" className="w-full rounded-lg border border-[#dce5dd] p-3" />
                                </label>
                                <label>
                                    <span className="mb-1 block text-sm font-bold text-[#405a48]">Appointment</span>
                                    <input name="scheduledDate" type="datetime-local" required min={minimumDateTime} className="w-full rounded-lg border border-[#dce5dd] p-3" />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="mt-6 w-full rounded-lg bg-[#247c4b] px-5 py-3 text-sm font-bold text-white disabled:bg-gray-400"
                            >
                                {bookingLoading ? "Submitting..." : "Submit booking request"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
