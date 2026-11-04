
import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router-dom";
import api from "./services/api";
import "./App.css";

function AppContent() {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user") || "null")
    );

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setRequests([]);
        setMessage("Logged out successfully.");
        navigate("/");
    };

    const loadHome = async () => {
        try {
            const [categoryResponse, serviceResponse] = await Promise.all([
                api.get("/categories"),
                api.get("/services")
            ]);

            setCategories(categoryResponse.data.categories || []);
            setServices(serviceResponse.data.services || []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not load services.");
        }
    };

    const loadRequests = async () => {
        if (!user) return;

        try {
            const endpoint = user.role === "SERVICE_PROVIDER"
                ? "/requests/provider"
                : "/requests/my";

            const response = await api.get(endpoint);
            setRequests(response.data.requests || []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not load bookings.");
        }
    };

    useEffect(() => {
        loadHome();
    }, []);

    useEffect(() => {
        loadRequests();
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });

            const token = response.data.token;
            const loggedInUser = response.data.user;

            if (!token || !loggedInUser) {
                throw new Error("Login response is missing token or user details.");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(loggedInUser));

            setUser(loggedInUser);
            setMessage("Welcome back, " + loggedInUser.name + "!");
            navigate("/");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Login failed."
            );
        }
    };

    const register = async (name, email, password) => {
        try {
            await api.post("/auth/register", { name, email, password });

            setMessage("Registration successful! Please log in.");
            navigate("/login");
        } catch (error) {
            setMessage(error.response?.data?.message || "Registration failed.");
        }
    };

    const bookService = async (serviceId, details) => {
        try {
            await api.post("/requests", {
                service: serviceId,
                ...details
            });

            setMessage("Your service request has been submitted!");
            loadRequests();
            navigate("/bookings");
        } catch (error) {
            setMessage(error.response?.data?.message || "Booking failed.");
        }
    };

    const cancelBooking = async (id) => {
        try {
            await api.put(`/requests/${id}/cancel`);
            setMessage("Booking cancelled successfully.");
            loadRequests();
        } catch (error) {
            setMessage(error.response?.data?.message || "Cancellation failed.");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/requests/${id}/status`, { status });
            setMessage("Booking status updated.");
            loadRequests();
        } catch (error) {
            setMessage(error.response?.data?.message || "Status update failed.");
        }
    };

    return (
        <>
            <header className="navbar">
                <Link to="/" className="logo">FixNear<span>.</span></Link>

                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>

                    {user?.role === "USER" && (
                        <Link to="/bookings">My Bookings</Link>
                    )}

                    {user?.role === "SERVICE_PROVIDER" && (
                        <Link to="/dashboard">Provider Dashboard</Link>
                    )}

                    {user?.role === "ADMIN" && (
                        <Link to="/admin">Admin</Link>
                    )}
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <span className="welcome">Hi, {user.name}</span>
                            <button className="btn btn-outline" onClick={logout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </header>

            {message && (
                <div className="message">
                    {message}
                    <button onClick={() => setMessage("")}>×</button>
                </div>
            )}

            <Routes>
                <Route path="/" element={
                    <Home
                        categories={categories}
                        services={services}
                        user={user}
                        bookService={bookService}
                        setMessage={setMessage}
                    />
                } />

                <Route path="/login" element={
                    <Login login={login} />
                } />

                <Route path="/register" element={
                    <Register register={register} />
                } />

                <Route path="/bookings" element={
                    <Bookings
                        user={user}
                        requests={requests}
                        cancelBooking={cancelBooking}
                    />
                } />

                <Route path="/dashboard" element={
                    <ProviderDashboard
                        user={user}
                        requests={requests}
                        updateStatus={updateStatus}
                    />
                } />

                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/admin" element={
                    <AdminDashboard user={user} />
                } />
            </Routes>

            <footer>
                <h2>FixNear<span>.</span></h2>
                <p>Reliable local services, right around the corner.</p>
                <p>© 2026 FixNear. All rights reserved.</p>
            </footer>
        </>
    );
}

function Home({ categories, services, user, bookService, setMessage }) {
    const [selectedService, setSelectedService] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("");

    const filteredServices = categoryFilter
        ? services.filter(service => service.category?._id === categoryFilter)
        : services;

    const submitBooking = (event) => {
        event.preventDefault();

        if (!user) {
            setMessage("Please log in as a customer before booking.");
            return;
        }

        if (user.role !== "USER") {
            setMessage("Only customer accounts can book services.");
            return;
        }

        const form = new FormData(event.target);

        bookService(selectedService._id, {
            description: form.get("description"),
            address: form.get("address"),
            city: form.get("city"),
            area: form.get("area"),
            pincode: form.get("pincode"),
            scheduledDate: form.get("scheduledDate")
        });
    };

    return (
        <>
            <section className="hero">
                <div className="hero-content">
                    <span className="eyebrow">LOCAL SERVICES MADE SIMPLE</span>
                    <h1>Find trusted professionals <span>near you.</span></h1>
                    <p>
                        From plumbing to electrical repairs, discover reliable
                        service providers in your neighbourhood.
                    </p>
                    <a href="#services" className="btn btn-primary hero-btn">
                        Explore Services →
                    </a>
                </div>
                <div className="hero-decoration">⌂</div>
            </section>

            <section className="section">
                <div className="section-heading">
                    <span className="eyebrow">WHAT DO YOU NEED?</span>
                    <h2>Explore Categories</h2>
                    <p>Find the right expert for your everyday needs.</p>
                </div>

                <div className="category-grid">
                    {categories.map(category => (
                        <button
                            className="category-card"
                            key={category._id}
                            onClick={() => {
                                setCategoryFilter(category._id);
                                document.getElementById("services")?.scrollIntoView();
                            }}
                        >
                            <span className="category-icon">⌂</span>
                            <strong>{category.name}</strong>
                        </button>
                    ))}
                </div>
            </section>

            <section className="section services-section" id="services">
                <div className="section-heading">
                    <span className="eyebrow">AVAILABLE PROFESSIONALS</span>
                    <h2>Popular Services</h2>
                    <p>Choose a service and book your appointment.</p>
                </div>

                <div className="filter-row">
                    <button
                        className={!categoryFilter ? "filter active" : "filter"}
                        onClick={() => setCategoryFilter("")}
                    >
                        All Services
                    </button>

                    {categories.map(category => (
                        <button
                            key={category._id}
                            className={categoryFilter === category._id ? "filter active" : "filter"}
                            onClick={() => setCategoryFilter(category._id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                <div className="service-grid">
                    {filteredServices.map(service => (
                        <div className="service-card" key={service._id}>
                            <div className="service-icon">🔧</div>
                            <span className="service-category">
                                {service.category?.name || "Home Service"}
                            </span>
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>

                            <div className="provider-info">
                                <strong>
                                    {service.provider?.businessName || "Service Provider"}
                                </strong>
                                <span>
                                    {service.provider?.city || ""}
                                </span>
                                <span>
                                    ⭐ {service.provider?.averageRating ?? 0}
                                </span>
                            </div>

                            <div className="service-bottom">
                                <strong className="price">
                                    ₹{service.price}
                                    <small> / {service.priceType === "HOURLY" ? "hour" : "service"}</small>
                                </strong>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setSelectedService(service)}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredServices.length === 0 && (
                    <p className="empty">No services available in this category yet.</p>
                )}
            </section>

            {selectedService && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button className="modal-close" onClick={() => setSelectedService(null)}>×</button>
                        <h2>Book {selectedService.name}</h2>
                        <p>Provider: {selectedService.provider?.businessName}</p>
                        <p>Price: ₹{selectedService.price}</p>

                        <form onSubmit={submitBooking}>
                            <label>Problem description</label>
                            <textarea name="description" required placeholder="Describe your issue..." />

                            <label>Address</label>
                            <input name="address" required placeholder="House / Street address" />

                            <div className="form-row">
                                <div>
                                    <label>City</label>
                                    <input name="city" required placeholder="City" />
                                </div>
                                <div>
                                    <label>Area</label>
                                    <input name="area" required placeholder="Area" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div>
                                    <label>Pincode</label>
                                    <input name="pincode" required placeholder="Pincode" />
                                </div>
                                <div>
                                    <label>Appointment date and time</label>
                                    <input name="scheduledDate" type="datetime-local" required />
                                </div>
                            </div>

                            <button className="btn btn-primary full-width">Confirm Booking</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function Login({ login }) {
    const submit = (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        login(form.get("email"), form.get("password"));
    };

    return (
        <section className="auth-section">
            <form className="auth-card" onSubmit={submit}>
                <span className="eyebrow">WELCOME BACK</span>
                <h2>Login to FixNear</h2>
                <p>Access your account and manage your services.</p>

                <label>Email address</label>
                <input name="email" type="email" required placeholder="you@example.com" />

                <label>Password</label>
                <input name="password" type="password" required placeholder="Enter password" />

                <button className="btn btn-primary full-width">Login</button>
                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </form>
        </section>
    );
}

function Register({ register }) {
    const submit = (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        register(
            form.get("name"),
            form.get("email"),
            form.get("password")
        );
    };

    return (
        <section className="auth-section">
            <form className="auth-card" onSubmit={submit}>
                <span className="eyebrow">GET STARTED</span>
                <h2>Create an account</h2>
                <p>Join FixNear and find reliable local professionals.</p>

                <label>Full name</label>
                <input name="name" required placeholder="Your full name" />

                <label>Email address</label>
                <input name="email" type="email" required placeholder="you@example.com" />

                <label>Password</label>
                <input name="password" type="password" minLength="8" required placeholder="At least 8 characters" />

                <button className="btn btn-primary full-width">Create Account</button>
                <p className="auth-switch">
                    Already registered? <Link to="/login">Login</Link>
                </p>
            </form>
        </section>
    );
}


function Bookings({ user, requests, cancelBooking }) {
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
            window.alert("Review submitted successfully!");
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


function ProviderDashboard({ user, requests, updateStatus }) {
    if (!user) return <MessagePage title="Login required" text="Please log in as a provider." />;

    if (user.role !== "SERVICE_PROVIDER") {
        return <MessagePage title="Access denied" text="This page is only for service providers." />;
    }

    return (
        <section className="section dashboard-section">
            <span className="eyebrow">PROFESSIONAL AREA</span>
            <h2>Provider Dashboard</h2>
            <p>Manage customer requests and update job progress.</p>

            {requests.length === 0 && <p className="empty">No service requests received yet.</p>}

            <div className="booking-list">
                {requests.map(request => (
                    <div className="booking-card" key={request._id}>
                        <div>
                            <span className={"status " + request.status.toLowerCase()}>
                                {request.status}
                            </span>
                            <h3>{request.service?.name}</h3>
                            <p>Customer: {request.user?.name || "Customer"}</p>
                            <p>{request.description}</p>
                            <p>Address: {request.address}, {request.area}, {request.city}</p>
                            <strong>₹{request.totalPrice}</strong>
                        </div>

                        <div className="status-actions">
                            {request.status === "PENDING" && (
                                <>
                                    <button className="btn btn-primary" onClick={() => updateStatus(request._id, "ACCEPTED")}>Accept</button>
                                    <button className="btn btn-outline danger" onClick={() => updateStatus(request._id, "REJECTED")}>Reject</button>
                                </>
                            )}
                            {request.status === "ACCEPTED" && (
                                <button className="btn btn-primary" onClick={() => updateStatus(request._id, "IN_PROGRESS")}>Start Work</button>
                            )}
                            {request.status === "IN_PROGRESS" && (
                                <button className="btn btn-primary" onClick={() => updateStatus(request._id, "COMPLETED")}>Complete Work</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}


function AdminDashboard({ user }) {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [message, setMessage] = useState("");

    const load = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data.categories || []);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to load categories.");
        }
    };

    useEffect(() => {
        if (user?.role === "ADMIN") load();
    }, [user]);

    const addCategory = async (event) => {
        event.preventDefault();

        try {
            await api.post("/categories", { name: categoryName });
            setCategoryName("");
            setMessage("Category created successfully.");
            await load();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not create category.");
        }
    };

    const startEdit = (category) => {
        setEditId(category._id);
        setEditName(category.name);
        setMessage("");
    };

    const updateCategory = async (event) => {
        event.preventDefault();

        try {
            await api.put(`/categories/${editId}`, {
                name: editName
            });

            setEditId(null);
            setEditName("");
            setMessage("Category updated successfully.");
            await load();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not update category.");
        }
    };

    const deleteCategory = async (categoryId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/categories/${categoryId}`);
            setMessage("Category deleted successfully.");
            await load();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not delete category.");
        }
    };

    if (!user || user.role !== "ADMIN") {
        return <MessagePage title="Access denied" text="Administrator access is required." />;
    }

    return (
        <section className="section dashboard-section">
            <span className="eyebrow">ADMINISTRATION</span>
            <h2>Admin Dashboard</h2>
            <p>Manage FixNear service categories.</p>

            <form className="inline-form" onSubmit={addCategory}>
                <input
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    required
                    placeholder="New category name"
                />
                <button className="btn btn-primary" type="submit">
                    Add Category
                </button>
            </form>

            {message && <p>{message}</p>}

            <div className="category-grid">
                {categories.map(category => (
                    <div className="category-card" key={category._id}>
                        {editId === category._id ? (
                            <form onSubmit={updateCategory}>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    required
                                />
                                <button className="btn btn-primary" type="submit">
                                    Save
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={() => setEditId(null)}
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <>
                                <strong>{category.name}</strong>

                                <div className="category-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => startEdit(category)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => deleteCategory(category._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

function About() {
    return (
        <section className="info-page">
            <span className="eyebrow">ABOUT FIXNEAR</span>
            <h1>Making local services easier.</h1>
            <p>
                FixNear connects customers with local service professionals.
                Our goal is to make finding, comparing and booking everyday
                home services simple and convenient.
            </p>
        </section>
    );
}

function Contact() {
    return (
        <section className="info-page">
            <span className="eyebrow">CONTACT US</span>
            <h1>We're here to help.</h1>
            <p>For questions or assistance, contact the FixNear support team.</p>
            <p>Email: support@fixnear.example</p>
            <p>Service hours: Monday – Saturday, 9 AM – 6 PM</p>
        </section>
    );
}

function MessagePage({ title, text }) {
    return (
        <section className="info-page">
            <h1>{title}</h1>
            <p>{text}</p>
            <Link to="/login" className="btn btn-primary">Login</Link>
        </section>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
