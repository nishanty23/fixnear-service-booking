import MessagePage from "../components/MessagePage";

export default function ProviderDashboard({ user, requests, updateStatus }) {
    if (!user) return <MessagePage title="Login required" text="Please log in as a provider." />;

    if (user.role !== "SERVICE_PROVIDER") {
        return <MessagePage title="Access denied" text="This page is only for service providers." />;
    }

    return (
        <section className="section dashboard-section">
            <span className="eyebrow">PROFESSIONAL AREA</span>
            <h2>Provider Dashboard</h2>
            <p>Manage customer requests and update job progress.</p>

            <div className="dashboard-stats">
                <div><strong>{requests.length}</strong><span>Total requests</span></div>
                <div><strong>{requests.filter(item => item.status === "PENDING").length}</strong><span>New requests</span></div>
                <div><strong>{requests.filter(item => item.status === "IN_PROGRESS").length}</strong><span>Active jobs</span></div>
                <div><strong>{requests.filter(item => item.status === "COMPLETED").length}</strong><span>Completed</span></div>
            </div>

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