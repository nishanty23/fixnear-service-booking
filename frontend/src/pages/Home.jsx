import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const categoryIcons = {
    Plumbing: "🔧",
    Electrical: "⚡",
    "AC Repair": "❄️",
    "Appliance Repair": "🧺",
    Carpentry: "🪚",
    Cleaning: "🧹"
};

export default function Home({ categories, services, user, bookService, setMessage }) {
    const [selectedService, setSelectedService] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("recommended");

    const filteredServices = useMemo(() => {
        let result = services.filter(service => {
            const matchesCategory = !categoryFilter || service.category?._id === categoryFilter;
            const term = search.trim().toLowerCase();
            const matchesSearch = !term ||
                service.name?.toLowerCase().includes(term) ||
                service.description?.toLowerCase().includes(term) ||
                service.category?.name?.toLowerCase().includes(term);
            return matchesCategory && matchesSearch;
        });

        if (sortBy === "low") result = [...result].sort((a, b) => a.price - b.price);
        if (sortBy === "high") result = [...result].sort((a, b) => b.price - a.price);
        return result;
    }, [services, categoryFilter, search, sortBy]);

    const submitBooking = (event) => {
        event.preventDefault();

        if (!user) {
            setMessage("Please log in with a customer account before booking.");
            setSelectedService(null);
            return;
        }

        if (user.role !== "USER") {
            setMessage("Only customer accounts can book services.");
            setSelectedService(null);
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
        setSelectedService(null);
    };

    return (
        <>
            <section className="hero hero-upgraded">
                <div className="hero-content">
                    <span className="eyebrow">YOUR HOME, IN GOOD HANDS</span>
                    <h1>Home services.<br /><span>Made simple.</span></h1>
                    <p>Book trusted local professionals for repairs, cleaning and everyday home needs — all in one place.</p>
                    <div className="hero-actions">
                        <a href="#services" className="btn btn-primary hero-btn">Explore Services <span>→</span></a>
                        <Link to="/how-it-works" className="btn btn-outline hero-btn">How it works</Link>
                    </div>
                    <div className="hero-trust">
                        <span>✓ Easy booking</span><span>✓ Local professionals</span><span>✓ Track every request</span>
                    </div>
                </div>
                <div className="hero-art" aria-label="Home services illustration">
                    <div className="hero-art-circle">🏡</div>
                    <div className="floating-tag tag-one">🔧 Plumbing</div>
                    <div className="floating-tag tag-two">⚡ Electrical</div>
                    <div className="floating-tag tag-three">❄️ AC Repair</div>
                </div>
            </section>

            <section className="quick-stats">
                <div><strong>{categories.length}+</strong><span>Service categories</span></div>
                <div><strong>{services.length}+</strong><span>Available services</span></div>
                <div><strong>Simple</strong><span>Booking experience</span></div>
            </section>

            <section className="section categories-section">
                <div className="section-heading">
                    <span className="eyebrow">HELP AROUND THE HOUSE</span>
                    <h2>What do you need help with?</h2>
                    <p>Choose a category to find the right professional.</p>
                </div>
                <div className="category-grid">
                    {categories.map(category => (
                        <button className="category-card category-card-upgraded" key={category._id}
                            onClick={() => {
                                setCategoryFilter(category._id);
                                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
                            }}>
                            <span className="category-icon">{categoryIcons[category.name] || "🏠"}</span>
                            <strong>{category.name}</strong>
                            <span className="category-arrow">Explore services →</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="section services-section" id="services">
                <div className="section-heading">
                    <span className="eyebrow">FIND YOUR PROFESSIONAL</span>
                    <h2>Popular home services</h2>
                    <p>Search, compare and book a service that works for you.</p>
                </div>

                <div className="service-tools">
                    <input className="service-search" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search plumbing, AC repair, cleaning..." aria-label="Search services" />
                    <select className="service-sort" value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort services">
                        <option value="recommended">Recommended</option>
                        <option value="low">Price: Low to high</option>
                        <option value="high">Price: High to low</option>
                    </select>
                </div>

                <div className="filter-row">
                    <button className={!categoryFilter ? "filter active" : "filter"} onClick={() => setCategoryFilter("")}>All Services</button>
                    {categories.map(category => (
                        <button key={category._id}
                            className={categoryFilter === category._id ? "filter active" : "filter"}
                            onClick={() => setCategoryFilter(category._id)}>{category.name}</button>
                    ))}
                </div>

                <div className="service-grid">
                    {filteredServices.map(service => (
                        <article className="service-card service-card-upgraded" key={service._id}>
                            <div className="service-card-top">
                                <div className="service-icon">{categoryIcons[service.category?.name] || "🛠️"}</div>
                                <span className="service-category">{service.category?.name || "Home Service"}</span>
                            </div>
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>
                            <div className="provider-info">
                                <strong>{service.provider?.businessName || "Service Provider"}</strong>
                                <span>📍 {service.provider?.area || service.provider?.city || "Local professional"}</span>
                                <span>⭐ {service.provider?.averageRating ?? "New"} provider rating</span>
                            </div>
                            <div className="service-bottom">
                                <strong className="price">₹{service.price}<small> / {service.priceType === "HOURLY" ? "hour" : "service"}</small></strong>
                                {user?.role === "USER" ? (
                                    <button className="btn btn-primary" onClick={() => setSelectedService(service)}>Book Now</button>
                                ) : !user ? (
                                    <Link className="btn btn-primary" to="/login">Login to Book</Link>
                                ) : (
                                    <span className="role-note">Customer booking only</span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
                {filteredServices.length === 0 && (
                    <div className="empty empty-panel">
                        <span>🔎</span><h3>No matching services found</h3>
                        <p>Try another search or clear the selected category.</p>
                        <button className="btn btn-outline" onClick={() => { setSearch(""); setCategoryFilter(""); }}>Clear filters</button>
                    </div>
                )}
            </section>

            <section className="section how-section">
                <div className="section-heading">
                    <span className="eyebrow">THREE SIMPLE STEPS</span>
                    <h2>Getting help is easy</h2>
                    <p>From finding a service to getting the work done.</p>
                </div>
                <div className="steps-grid">
                    <div className="step-card"><span>01</span><div>🔍</div><h3>Find a service</h3><p>Browse categories and choose the service you need.</p></div>
                    <div className="step-card"><span>02</span><div>📅</div><h3>Book a slot</h3><p>Share your address, explain the issue and select a suitable time.</p></div>
                    <div className="step-card"><span>03</span><div>🏡</div><h3>Get it done</h3><p>Track your request as the professional accepts and completes the work.</p></div>
                </div>
            </section>

            <section className="why-section">
                <div><span className="eyebrow">WHY FIXNEAR?</span><h2>Less searching.<br />More living.</h2><p>FixNear brings everyday home services together with a simple booking and tracking experience.</p></div>
                <div className="why-points">
                    <div><span>✓</span><section><strong>Convenient discovery</strong><p>Explore multiple service categories in one place.</p></section></div>
                    <div><span>✓</span><section><strong>Transparent service details</strong><p>See service descriptions, provider details and starting prices.</p></section></div>
                    <div><span>✓</span><section><strong>Booking updates</strong><p>Follow your request from pending to completion.</p></section></div>
                </div>
            </section>

            <section className="final-cta">
                <div><span className="eyebrow">READY TO GET STARTED?</span><h2>Your to-do list just got shorter.</h2><p>Find the right help for your home today.</p></div>
                <a href="#services" className="btn btn-light">Find a Service →</a>
            </section>

            {selectedService && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedService(null); }}>
                    <div className="modal">
                        <button className="modal-close" onClick={() => setSelectedService(null)}>×</button>
                        <span className="eyebrow">BOOK A PROFESSIONAL</span>
                        <h2>Book {selectedService.name}</h2>
                        <p>Provider: {selectedService.provider?.businessName}</p>
                        <p>Price: ₹{selectedService.price}</p>
                        <form onSubmit={submitBooking}>
                            <label>Problem description</label>
                            <textarea name="description" required placeholder="Describe what needs to be fixed..." />
                            <label>Address</label>
                            <input name="address" required placeholder="House / Street address" />
                            <div className="form-row">
                                <div><label>City</label><input name="city" required placeholder="City" /></div>
                                <div><label>Area</label><input name="area" required placeholder="Area" /></div>
                            </div>
                            <div className="form-row">
                                <div><label>Pincode</label><input name="pincode" required pattern="[0-9]{6}" maxLength="6" placeholder="6-digit pincode" /></div>
                                <div><label>Appointment date and time</label><input name="scheduledDate" type="datetime-local" required /></div>
                            </div>
                            <button className="btn btn-primary full-width" type="submit">Confirm Booking</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}