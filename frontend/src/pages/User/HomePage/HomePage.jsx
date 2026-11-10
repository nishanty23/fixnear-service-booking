import {Button, Rating} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import carpenter from "../../../assets/carpenter.jpg";
import plumber from "../../../assets/plumber.png";
import painter from "../../../assets/painter.jpg";
import electrician from "../../../assets/electrician.jpg";

import { useEffect, useState } from "react";
import { getNearbyCategories, getServices } from "../../../services/catalogService";
import { getCustomerRequests } from "../../../services/requestService";
import { useLocation } from "../../../context/LocationContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../../components/Footer.jsx";

const ServiceImage = ({ src, alt, className = "" }) => {
    return (
        <img
            src={src || "/assets/fixnear-icon.png"}
            alt={alt}
            className={`object-cover ${className}`}
            onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/assets/fixnear-icon.png";
            }}
        />
    );
};



const CategoryCard = ({ category }) => {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            onClick={() => navigate(`/services?category=${category._id}`)}
            className="group flex min-w-0 flex-col items-center rounded-xl p-2 text-center transition-all duration-200 hover:bg-[#eef5ef]"
        >

            <ServiceImage
                src={category.image}
                alt={category.name}
                className="mb-3 h-20 w-full rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
            />

            <h3 className="text-sm font-semibold leading-5 text-gray-800 group-hover:text-[#247c4b]">
                {category.name}
            </h3>

        </button>
    );
};



const PopularServiceCard = ({ service }) => {
    return (
        <Link to={`/services/${service._id}`} className="group min-w-0 cursor-pointer">

            {/* Service Image */}
            <div className="relative overflow-hidden rounded-xl">

                <ServiceImage
                    src={service.image}
                    alt={service.name}
                    className="h-52 w-full transition-transform duration-300 group-hover:scale-[1.03]"
                />

                <div className="absolute bottom-3 left-3 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                    <AccessTimeOutlinedIcon
                        sx={{ fontSize: 14 }}
                        className="mr-1 align-middle"
                    />
                    {service.priceType === "HOURLY" ? "Hourly service" : "Bookable service"}
                </div>

            </div>

            {/* Service Details */}
            <div className="mt-3">

                <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-gray-900 group-hover:text-[#247c4b]">
                    {service.name}
                </h3>

                {/* Rating */}
                <div className="mt-1 flex items-center gap-2">

                    <Rating
                        value={service.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                    />

                    <span className="text-sm text-gray-600">
                        {service.provider?.averageRating || "New"}
                    </span>

                    <span className="text-xs text-gray-400">
                        ({service.provider?.reviewCount || 0})
                    </span>

                </div>

                {/* Price */}
                <div className="mt-2 flex items-center gap-2">

                    <span className="text-base font-semibold text-gray-900">
                        ₹{service.price.toLocaleString("en-IN")}
                    </span>

                </div>

            </div>
            </Link>
    );
};

const HeroImageCollage = () => {
    return (
        <div className="grid h-[560px] grid-cols-2 gap-3">

            {/* Left Column */}
            <div className="flex min-h-0 flex-col gap-3">

                {/* Carpenter */}
                <div className="h-[65%] min-h-0 overflow-hidden rounded-xl">
                    <img
                        src={carpenter}
                        alt="Professional carpenter working with wood"
                        className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {/* Plumber */}
                <div className="h-[35%] min-h-0 overflow-hidden rounded-xl">
                    <img
                        src={plumber}
                        alt="Professional plumber repairing a sink"
                        className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                </div>

            </div>

            {/* Right Column */}
            <div className="flex min-h-0 flex-col gap-3">

                {/* Painter */}
                <div className="h-[43%] min-h-0 overflow-hidden rounded-xl">
                    <img
                        src={painter}
                        alt="Professional painter painting a wall"
                        className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {/* Electrician */}
                <div className="h-[57%] min-h-0 overflow-hidden rounded-xl">
                    <img
                        src={electrician}
                        alt="Professional electrician installing equipment"
                        className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                </div>

            </div>

        </div>
    );
};



// ==========================================
// HERO SECTION
// ==========================================

const HeroSection = ({ categories, loading, error }) => {
    const visibleCategories = categories.slice(0, 7);

    return (
        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">

            {/* Left Section */}
            <div>

                <div className="mb-6">

                    <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-gray-950 md:text-5xl">
                        Home services at your{" "}
                        <span className="text-[#247c4b]">
                            Doorstep
                        </span>
                    </h1>

                </div>


                {/* Categories */}
                <div className="rounded-xl border border-gray-200 p-4 md:p-5">
                    {loading && (
                        <p className="py-8 text-center text-sm text-gray-500">
                            Loading nearby categories...
                        </p>
                    )}

                    {error && (
                        <p className="py-8 text-center text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {!loading && !error && categories.length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-500">
                            No services found near this location.
                        </p>
                    )}

                    {!loading && !error && categories.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                            {visibleCategories.map((category) => (
                                <CategoryCard
                                    key={category._id}
                                    category={category}
                                />
                            ))}

                            <Link
                                to="/services"
                                className="group flex flex-col items-center justify-center rounded-xl p-2 text-center transition-colors hover:bg-[#eef5ef]"
                            >
                                <div className="mb-3 flex h-20 w-full items-center justify-center rounded-lg bg-gray-100">
                                    <ArrowForwardIcon
                                        className="text-[#247c4b]"
                                        fontSize="large"
                                    />
                                </div>

                                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#247c4b]">
                                    See all
                                </h3>
                            </Link>
                        </div>
                    )}
                </div>



            </div>


            {/* Right Section */}
            <div className="hidden lg:block">

                <HeroImageCollage />

            </div>

        </section>
    );
};


// ==========================================
// MOST BOOKED SERVICES SECTION
// ==========================================

const MostBookedServices = ({ services, loading, error }) => {
    return (
        <section className="mt-20">

            {/* Section Heading */}
            <div className="mb-7 flex items-center justify-between">

                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-950 md:text-3xl">
                        Most booked services
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 md:text-base">
                        Services customers frequently book near you.
                    </p>
                </div>

                <Button
                    variant="text"
                    endIcon={<ArrowForwardIcon />}
                    className="!hidden !normal-case !font-semibold !text-[#247c4b] sm:!flex"
                >
                    View all
                </Button>

            </div>


            {/* Service Cards */}
            {loading && <p className="text-sm text-gray-500">Loading services...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && services.length === 0 && (
                <p className="text-sm text-gray-500">No services are available yet.</p>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {services.slice(0, 10).map((service) => (
                    <PopularServiceCard
                        key={service._id}
                        service={service}
                    />
                ))}

            </div>

        </section>
    );
};

const UpcomingBookings = ({ bookings, loading, error }) => {
    if (loading) {
        return (
            <section className="mt-20">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-950 md:text-3xl">
                    Upcoming bookings
                </h2>
                <p className="mt-4 text-sm text-gray-500">Loading your bookings...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="mt-20">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-950 md:text-3xl">
                    Upcoming bookings
                </h2>
                <p className="mt-4 text-sm text-red-600">{error}</p>
            </section>
        );
    }

    return (
        <section className="mt-20">
            <div className="mb-7 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-950 md:text-3xl">
                        Upcoming bookings
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 md:text-base">
                        Your accepted service appointments.
                    </p>
                </div>

                <Link
                    to="/bookings"
                    className="hidden font-semibold text-[#247c4b] hover:underline sm:block"
                >
                    View all
                </Link>
            </div>

            {bookings.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    You have no accepted upcoming bookings.
                </p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {bookings.map((booking) => (
                        <article
                            key={booking._id}
                            className="rounded-xl border border-[#e1eae2] bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#254b32]">
                                        {booking.service?.name || "Service booking"}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {booking.provider?.businessName || "Assigned provider"}
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#e0f4e5] px-3 py-1 text-xs font-bold text-[#247344]">
                                    ACCEPTED
                                </span>
                            </div>

                            <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                <p>
                                    <span className="font-semibold text-gray-800">Date:</span>{" "}
                                    {new Date(booking.scheduledDate).toLocaleDateString()}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-800">Time:</span>{" "}
                                    {new Date(booking.scheduledDate).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};


// ==========================================
// HOMEPAGE
// ==========================================

const HomePage = () => {
    const { location } = useLocation();
    const [serviceCategories, setServiceCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoryError, setCategoryError] = useState("");
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [serviceError, setServiceError] = useState("");
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        getServices()
            .then(response => setServices(response.data.services || []))
            .catch(error => setServiceError(error.response?.data?.message || "Unable to load services."))
            .finally(() => setLoadingServices(false));
    }, []);

    useEffect(() => {
        const loadNearbyCategories = async () => {
            try {
                setLoadingCategories(true);
                setCategoryError("");

                const response = await getNearbyCategories(
                    location.latitude,
                    location.longitude
                );

                setServiceCategories(response.data.categories || []);
            } catch (error) {
                setServiceCategories([]);
                setCategoryError(
                    error.response?.data?.message ||
                    "Unable to load nearby categories."
                );
            } finally {
                setLoadingCategories(false);
            }
        };

        loadNearbyCategories();
    }, [location.latitude, location.longitude]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!localStorage.getItem("token") || user?.role !== "USER") {
            setUpcomingBookings([]);
            return;
        }

        const loadUpcomingBookings = async () => {
            try {
                setLoadingBookings(true);
                setBookingError("");

                const response = await getCustomerRequests();
                setUpcomingBookings(
                    (response.data.requests || []).filter(
                        (booking) =>
                            booking.status === "ACCEPTED" &&
                            new Date(booking.scheduledDate).getTime() > Date.now()
                    )
                );
            } catch (error) {
                setUpcomingBookings([]);
                setBookingError(
                    error.response?.data?.message ||
                    "Unable to load upcoming bookings."
                );
            } finally {
                setLoadingBookings(false);
            }
        };

        loadUpcomingBookings();
    }, []);

    return (
        <>
            <main className="min-h-screen bg-white">
                <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 lg:py-12">
                    <HeroSection
                        categories={serviceCategories}
                        loading={loadingCategories}
                        error={categoryError}
                    />

                    <UpcomingBookings
                        bookings={upcomingBookings}
                        loading={loadingBookings}
                        error={bookingError}
                    />

                    <MostBookedServices
                        services={services}
                        loading={loadingServices}
                        error={serviceError}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
};

export default HomePage;