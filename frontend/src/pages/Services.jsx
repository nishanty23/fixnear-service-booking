import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchServices } from "../services/catalogService";

export default function Services() {
    const [searchParams] = useSearchParams();
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(Boolean(search || category));
    const [error, setError] = useState("");

    useEffect(() => {
        if (!search && !category) {
            setServices([]);
            setLoading(false);
            return;
        }

        const loadServices = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await searchServices(search, category);
                setServices(response.data.services || []);
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                    "Unable to search services."
                );
            } finally {
                setLoading(false);
            }
        };

        loadServices();
    }, [search, category]);

    return (
        <main className="min-h-[600px] bg-[#f7faf7] px-5 py-12 sm:px-10 lg:px-[8%]">
            <div className="mx-auto max-w-6xl">
                <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">
                    SERVICE SEARCH
                </span>
                <h1 className="mt-3 text-3xl font-bold text-[#183d29]">
                    {search ? `Results for "${search}"` : "Services"}
                </h1>

                {loading && <p className="mt-8 text-[#75847a]">Searching services...</p>}
                {error && <p className="mt-8 text-red-600">{error}</p>}
                {!loading && !error && search && services.length === 0 && (
                    <p className="mt-8 text-[#75847a]">
                        No services matched your search.
                    </p>
                )}

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map(service => (
                        <article
                            className="rounded-xl border border-[#e1eae2] bg-white p-5 shadow-sm"
                            key={service._id}
                        >
                            <img
                                src={service.image || "/assets/fixnear-icon.png"}
                                alt={service.name}
                                className="mb-4 h-40 w-full rounded-lg object-cover"
                                onError={(event) => {
                                    event.currentTarget.src = "/assets/fixnear-icon.png";
                                }}
                            />
                            <span className="text-xs font-bold text-[#348356]">
                                {service.category?.name || "Home Service"}
                            </span>
                            <h2 className="mt-2 text-xl font-bold text-[#254b32]">
                                {service.name}
                            </h2>
                            <p className="mt-2 text-sm text-[#718075]">
                                {service.description}
                            </p>
                            <div className="mt-5 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm text-[#718075]">
                                        {service.provider?.businessName || "Service Provider"}
                                    </p>
                                    <p className="text-xs text-[#718075]">
                                        {service.provider?.city || ""}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <strong className="block text-[#247c4b]">₹{service.price}</strong>
                                    <Link
                                        to={`/services/${service._id}`}
                                        className="mt-2 inline-block text-xs font-bold text-[#247c4b] hover:underline"
                                    >
                                        View details
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
