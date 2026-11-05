import { useState } from "react";
import api from "../services/api";
import MessagePage from "../components/MessagePage";

export default function Bookings({ user, requests, cancelBooking, removeFromHistory }) {
    const [reviewId, setReviewId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [message, setMessage] = useState("");
    const [reviewed, setReviewed] = useState([]);

    if (!user) {
        return <MessagePage title="Login required" text="Please log in to view your bookings." />;
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
        <section className="section dashboard-section">
            <span className="eyebrow">CUSTOMER AREA</span>
            <h2>My Bookings</h2>
            <p>Track and manage your service requests.</p>

            <div className="dashboard-stats">
                <div><strong>{requests.length}</strong><span>Total bookings</span></div>
                <div><strong>{requests.filter(item => item.status === "PENDING").length}</strong><span>Pending</span></div>
                <div><strong>{requests.filter(item => item.status === "IN_PROGRESS").length}</strong><span>In progress</span></div>
                <div><strong>{requests.filter(item => item.status === "COMPLETED").length}</strong><span>Completed</span></div>
            </div>

            {message && <p>{message}</p>}

            {requests.length === 0 && (
                <p className="empty">You don't have any bookings yet.</p>
            )}

            <div className="booking-list">
                {requests.map(request => (
                    <div className="booking-card" key={request._id}>
                        <div>
                            <span className={"status " + request.status.toLowerCase()}>
                                {request.status}
                            </span>

                            <h3>{request.service?.name || "Service Request"}</h3>

                            <p>{request.description}</p>

                            <p>
                                Provider: {request.provider?.businessName || "Assigned provider"}
                            </p>

                            <p>
                                Scheduled: {new Date(request.scheduledDate).toLocaleString()}
                            </p>

                            <strong>₹{request.totalPrice}</strong>
                        </div>

                        {request.status === "PENDING" && (
                            <button
                                className="btn btn-outline danger"
                                onClick={() => cancelBooking(request._id)}
                            >
                                Cancel Booking
                            </button>
                        )}

                        {(request.status === "COMPLETED" || request.status === "CANCELLED") && (
                            <button
                                className="btn btn-outline danger"
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
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setReviewId(request._id);
                                        setMessage("");
                                    }}
                                >
                                    Write Review
                                </button>
                            )}

                        {reviewed.includes(request._id) && (
                            <p className="review-success">
                                Review submitted ✓
                            </p>
                        )}

                        {reviewId === request._id && (
                            <form className="review-form" onSubmit={submitReview}>
                                <h3>Rate Your Experience</h3>

                                <label>Rating</label>

                                <select
                                    value={rating}
                                    onChange={e => setRating(Number(e.target.value))}
                                >
                                    <option value={5}>5 - Excellent</option>
                                    <option value={4}>4 - Very Good</option>
                                    <option value={3}>3 - Good</option>
                                    <option value={2}>2 - Average</option>
                                    <option value={1}>1 - Poor</option>
                                </select>

                                <label>Comment</label>

                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    required
                                />

                                <button className="btn btn-primary" type="submit">
                                    Submit Review
                                </button>

                                <button
                                    className="btn btn-secondary"
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