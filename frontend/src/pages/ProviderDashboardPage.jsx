import { useEffect, useState } from "react";
import MessagePage from "../components/MessagePage";
import ProviderDashboard from "./ProviderDashboard";
import { getProviderRequests, updateRequestStatus } from "../services/requestService";

export default function ProviderDashboardPage() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user?.role !== "SERVICE_PROVIDER") return;

        getProviderRequests()
            .then(response => setRequests(response.data.requests || []))
            .catch(requestError => {
                setError(
                    requestError.response?.data?.message ||
                    "Unable to load provider requests."
                );
            });
    }, [user?.role]);

    if (!user) return <MessagePage title="Login required" text="Please log in as a provider." />;
    if (user.role !== "SERVICE_PROVIDER") {
        return <MessagePage title="Access denied" text="This page is only for service providers." />;
    }
    if (error) {
        return <MessagePage title="Unable to load dashboard" text={error} />;
    }

    const updateStatus = async (id, status) => {
        const response = await updateRequestStatus(id, status);
        setRequests(current =>
            current.map(request =>
                request._id === id ? response.data.request : request
            )
        );
    };

    return <ProviderDashboard user={user} requests={requests} updateStatus={updateStatus} />;
}
