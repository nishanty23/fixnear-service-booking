export default function ServiceCard({ service, onBook }) {
    return (
        <div className="service-card">
            {service.image ? (
                <img
                    src={service.image}
                    alt={service.name}
                    className="service-image"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/assets/fixnear-icon.png";
                    }}
                />
            ) : (
                <div className="service-icon">🔧</div>
            )}
            <span className="service-category">
                {service.category?.name || "Home Service"}
            </span>
            <h3>{service.name}</h3>
            <p>{service.description}</p>

            <div className="provider-info">
                <strong>{service.provider?.businessName || "Service Provider"}</strong>
                <span>{service.provider?.city || ""}</span>
                <span>⭐ {service.provider?.averageRating ?? 0}</span>
            </div>

            <div className="service-bottom">
                <strong className="price">
                    ₹{service.price}
                    <small> / {service.priceType === "HOURLY" ? "hour" : "service"}</small>
                </strong>
                <button className="btn btn-primary" onClick={() => onBook(service)}>
                    Book Now
                </button>
            </div>
        </div>
    );
}