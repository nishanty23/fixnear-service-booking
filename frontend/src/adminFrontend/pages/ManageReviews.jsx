import { useEffect, useState } from "react";
import {
    FiStar,
    FiSearch,
    FiTrash2,
    FiRefreshCw,
    FiMessageSquare
} from "react-icons/fi";

import {
    getAllReviews,
    deleteReview
} from "../services/reviewService";

function ManageReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [rating, setRating] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalReviews: 0,
        totalPages: 0
    });

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllReviews({
                search,
                rating,
                page: currentPage,
                limit: 10
            });

            setReviews(response.reviews || []);
            setPagination(response.pagination || {
                totalReviews: 0,
                totalPages: 0
            });

        } catch (err) {
            console.error("Fetch reviews error:", err);
            setError(err.message || "Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [search, rating, currentPage]);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmDelete) return;

        try {
            await deleteReview(id);
            alert("Review deleted successfully!");

            fetchReviews();

        } catch (err) {
            console.error("Delete review error:", err);
            alert(err.message || "Failed to delete review");
        }
    };

    const renderStars = (value) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        size={16}
                        className={
                            star <= value
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        }
                    />
                ))}
                <span className="ml-1 text-sm font-semibold">
                    {value}/5
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Manage Reviews
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View and manage customer feedback.
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-3 text-green-700">
                            <FiMessageSquare size={22} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Reviews
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800">
                                {pagination.totalReviews}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
                            <FiStar size={22} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Displayed Reviews
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800">
                                {reviews.length}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row">

                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                        type="text"
                        placeholder="Search customer, provider or comment..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600"
                    />
                </div>

                <select
                    value={rating}
                    onChange={(e) => {
                        setRating(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-green-600"
                >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>

            </div>

            {/* Reviews Table */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="font-bold text-gray-800">
                        Customer Reviews
                    </h2>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading reviews...
                    </div>
                ) : error ? (
                    <div className="p-10 text-center text-red-500">
                        {error}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No reviews found.
                    </div>
                ) : (

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">

                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Provider</th>
                                    <th className="px-5 py-4">Service</th>
                                    <th className="px-5 py-4">Rating</th>
                                    <th className="px-5 py-4">Comment</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {reviews.map((review) => (
                                    <tr
                                        key={review._id}
                                        className="transition hover:bg-gray-50"
                                    >

                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-800">
                                                {review.user?.name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {review.user?.email || "-"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-800">
                                                {review.provider?.businessName ||
                                                    review.provider?.user?.name ||
                                                    "Unknown"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            {review.serviceRequest?.service?.name || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            {renderStars(review.rating)}
                                        </td>

                                        <td className="max-w-xs px-5 py-4 text-gray-600">
                                            {review.comment}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN")}
                                        </td>

                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                title="Delete Review"
                                                className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                            >
                                                <FiTrash2 size={17} />
                                            </button>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">

                        <p className="text-sm text-gray-500">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </p>

                        <div className="flex gap-2">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <button
                                disabled={currentPage >= pagination.totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default ManageReviews;
