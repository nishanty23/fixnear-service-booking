import { useEffect, useState } from "react";
import api from "../services/api";
import {
    cancelRequest,
    getCustomerRequests,
    hideRequestFromHistory
} from "../services/requestService";
import MessagePage from "../components/MessagePage";

export default function Bookings() {
    const [user] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [reviewId, setReviewId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [message, setMessage] = useState("");
    const [reviewed, setReviewed] = useState([]);

    useEffect(() => {
        if (!user || user.role !== "USER") {
            setLoading(false);
            return;
        }

        const loadRequests = async () => {
            try {
                const response = await getCustomerRequests();
                setRequests(response.data.requests || []);
            } catch (error) {
                setLoadError(
                    error.response?.data?.message || "Unable to load your bookings."
                );
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, [user]);

    const cancelBooking = async (id) => {
        try {
            await cancelRequest(id);
            setRequests(currentRequests =>
                currentRequests.map(request =>
                    request._id === id
                        ? { ...request, status: "CANCELLED" }
                        : request
                )
            );
            setMessage("Booking cancelled successfully.");
        } catch (error) {
            setMessage(error.response?.data?.message || "Cancellation failed.");
        }
    };

    const removeFromHistory = async (id) => {
        try {
            await hideRequestFromHistory(id);
            setRequests(currentRequests =>
                currentRequests.filter(request => request._id !== id)
            );
            setMessage("Booking removed from your history.");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Could not remove booking."
            );
        }
    };

    if (!user) {
        return <MessagePage title="Login required" text="Please log in to view your bookings." />;
    }

    if (user.role !== "USER") {
        return <MessagePage title="Access denied" text="Only customer accounts can view bookings." />;
    }

    if (loading) {
        return <p className="min-h-[480px] px-[8%] py-[75px] text-neutral-600">Loading your bookings...</p>;
    }

    if (loadError) {
        return (
            <section className="min-h-[480px] px-[8%] py-[75px]">
                <h2 className="my-3 font-[Manrope,sans-serif] text-[34px] text-[#183d29]">My Bookings</h2>
                <p className="text-[#75847a]">{loadError}</p>
            </section>
        );
    }

    const submitReview = async (event) => {
        event.preventDefault();

        try {
            await api.post("/reviews", {
                serviceRequest: reviewId,
                rating: rating,
                comment: comment
            });

            setReviewed([...reviewed, reviewId]);
            setReviewId(null);
            setRating(5);
            setComment("");
            setMessage("Thank you! Your review was submitted successfully.");

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to submit review."
            );
        }
    };

    return (
        <section className="min-h-[600px] px-[8%] py-[75px]">
            <span className="text-[11px] font-extrabold tracking-[2px] text-[#348356]">CUSTOMER AREA</span>
            <h2 className="my-3 font-[Manrope,sans-serif] text-[34px] text-[#183d29]">My Bookings</h2>
            <p className="text-[#75847a]">Track and manage your service requests.</p>

            <div className="my-7 grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5 rounded-xl border border-[#e3ece4] bg-white p-[19px] shadow-[0_5px_18px_rgba(23,63,43,0.02)]"><strong className="font-[Manrope,sans-serif] text-[25px] font-extrabold text-[#247c4b]">{requests.length}</strong><span className="text-xs text-[#78857b]">Total bookings</span></div>
                <div className="flex flex-col gap-1.5 rounded-xl border border-[#e3ece4] bg-white p-[19px] shadow-[0_5px_18px_rgba(23,63,43,0.02)]"><strong className="font-[Manrope,sans-serif] text-[25px] font-extrabold text-[#247c4b]">{requests.filter(item => item.status === "PENDING").length}</strong><span className="text-xs text-[#78857b]">Pending</span></div>
                <div className="flex flex-col gap-1.5 rounded-xl border border-[#e3ece4] bg-white p-[19px] shadow-[0_5px_18px_rgba(23,63,43,0.02)]"><strong className="font-[Manrope,sans-serif] text-[25px] font-extrabold text-[#247c4b]">{requests.filter(item => item.status === "IN_PROGRESS").length}</strong><span className="text-xs text-[#78857b]">In progress</span></div>
                <div className="flex flex-col gap-1.5 rounded-xl border border-[#e3ece4] bg-white p-[19px] shadow-[0_5px_18px_rgba(23,63,43,0.02)]"><strong className="font-[Manrope,sans-serif] text-[25px] font-extrabold text-[#247c4b]">{requests.filter(item => item.status === "COMPLETED").length}</strong><span className="text-xs text-[#78857b]">Completed</span></div>
            </div>

            {message && <p className="rounded-lg bg-[#e0f4e5] px-4 py-3 text-sm text-[#247344]">{message}</p>}

            {requests.length === 0 && (
                <p className="p-[35px] text-center text-[#75847a]">You don't have any bookings yet.</p>
            )}

            <div className="mt-[30px] grid gap-4">
                {requests.map(request => (
                    <div className="flex flex-col items-start justify-between gap-5 rounded-xl border border-[#e1eae2] bg-white p-6 shadow-[0_5px_20px_rgba(23,63,43,0.03)] md:flex-row md:items-center" key={request._id}>
                        <div className="w-full">
                            <span className={`inline-block rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ${
                                request.status === "PENDING"
                                    ? "bg-[#fff3d7] text-[#926516]"
                                    : ["ACCEPTED", "IN_PROGRESS"].includes(request.status)
                                        ? "bg-[#e2efff] text-[#2861a1]"
                                        : request.status === "COMPLETED"
                                            ? "bg-[#e0f4e5] text-[#247344]"
                                            : "bg-[#fde7e7] text-[#a23a3a]"
                            }`}>
                                {request.status}
                            </span>

                            <h3 className="my-[13px] mb-2 text-lg font-bold text-[#254b32]">{request.service?.name || "Service Request"}</h3>

                            <p className="text-[13px] text-[#718075]">{request.description}</p>

                            <p className="text-[13px] text-[#718075]">
                                Provider: {request.provider?.businessName || "Assigned provider"}
                            </p>

                            <p className="text-[13px] text-[#718075]">
                                Scheduled: {new Date(request.scheduledDate).toLocaleString()}
                            </p>

                            <strong className="text-[#247c4b]">₹{request.totalPrice}</strong>
                        </div>

                        {request.status === "PENDING" && (
                            <button
                                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#eacaca] bg-white px-[19px] py-[11px] text-[13px] font-bold text-[#ad4242] transition hover:bg-[#f0f6f1]"
                                onClick={() => cancelBooking(request._id)}
                            >
                                Cancel Booking
                            </button>
                        )}

                        {(request.status === "COMPLETED" || request.status === "CANCELLED") && (
                            <button
                                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#eacaca] bg-white px-[19px] py-[11px] text-[13px] font-bold text-[#ad4242] transition hover:bg-[#f0f6f1]"
                                onClick={() => {
                                    if (window.confirm("Remove this booking from your history? The booking record will be retained.")) {
                                        removeFromHistory(request._id);
                                    }
                                }}
                            >
                                Remove from History
                            </button>
                        )}

                        {request.status === "COMPLETED" &&
                            !reviewed.includes(request._id) && (
                                <button
                                    className="inline-flex items-center justify-center rounded-lg bg-[#247c4b] px-[19px] py-[11px] text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#185e38]"
                                    onClick={() => {
                                        setReviewId(request._id);
                                        setMessage("");
                                    }}
                                >
                                    Write Review
                                </button>
                            )}

                        {reviewed.includes(request._id) && (
                            <p className="font-bold text-[#16834a]">
                                Review submitted ✓
                            </p>
                        )}

                        {reviewId === request._id && (
                            <form className="mt-5 flex w-full flex-col gap-3 rounded-xl bg-[#f5f8f6] p-5" onSubmit={submitReview}>
                                <h3 className="m-0">Rate Your Experience</h3>

                                <label className="text-sm font-bold text-[#405a48]">Rating</label>

                                <select
                                    className="w-full rounded-lg border border-[#d1d5db] p-3"
                                    value={rating}
                                    onChange={e => setRating(Number(e.target.value))}
                                >
                                    <option value={5}>5 - Excellent</option>
                                    <option value={4}>4 - Very Good</option>
                                    <option value={3}>3 - Good</option>
                                    <option value={2}>2 - Average</option>
                                    <option value={1}>1 - Poor</option>
                                </select>

                                <label className="text-sm font-bold text-[#405a48]">Comment</label>

                                <textarea
                                    className="min-h-[100px] w-full resize-y rounded-lg border border-[#d1d5db] p-3"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    required
                                />

                                <button className="inline-flex items-center justify-center rounded-lg bg-[#247c4b] px-[19px] py-[11px] text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#185e38]" type="submit">
                                    Submit Review
                                </button>

                                <button
                                    className="inline-flex items-center justify-center rounded-lg border border-[#cbd8ce] bg-white px-[19px] py-[11px] text-[13px] font-bold text-[#244c34] transition hover:bg-[#f0f6f1]"
                                    type="button"
                                    onClick={() => setReviewId(null)}
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}