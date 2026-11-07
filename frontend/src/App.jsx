import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser } from "./services/authService";
import { getCategories, getServices } from "./services/catalogService";
import {
    getCustomerRequests,
    getProviderRequests,
    createRequest,
    cancelRequest,
    updateRequestStatus,
    hideRequestFromHistory as hideRequest
} from "./services/requestService";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Bookings from "./pages/Bookings";
import ProviderDashboard from "./pages/ProviderDashboard";
import OldAdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MessageAlert from "./components/MessageAlert";

//admin imports
import AdminLogin from "./adminFrontend/pages/AdminLogin";
import AdminLayout from "./adminFrontend/layouts/AdminLayout";
import AdminDashboard from "./adminFrontend/pages/AdminDashboard";
import ManageUsers from "./adminFrontend/pages/ManageUsers";
import ManageProviders from "./adminFrontend/pages/ManageProviders";
import ManageServices from "./adminFrontend/pages/ManageServices";
import ManageBookings from "./adminFrontend/pages/ManageBookings";


function AppContent() {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user") || "null")
    );

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const location = useLocation();

    const isAdminRoute = location.pathname.startsWith("/admin");

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
                getCategories(),
                getServices()
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
            const response = user.role === "SERVICE_PROVIDER"
                ? await getProviderRequests()
                : await getCustomerRequests();
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
            const response = await loginUser(email, password);

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
            await registerUser(name, email, password);

            setMessage("Registration successful! Please log in.");
            navigate("/login");
        } catch (error) {
            setMessage(error.response?.data?.message || "Registration failed.");
        }
    };

    const bookService = async (serviceId, details) => {
        try {
            await createRequest(serviceId, details);

            setMessage("Your service request has been submitted!");
            loadRequests();
            navigate("/bookings");
        } catch (error) {
            setMessage(error.response?.data?.message || "Booking failed.");
        }
    };

    const cancelBooking = async (id) => {
        try {
            await cancelRequest(id);
            setMessage("Booking cancelled successfully.");
            loadRequests();
        } catch (error) {
            setMessage(error.response?.data?.message || "Cancellation failed.");
        }
    };

    const removeFromHistory = async (id) => {
        try {
            await hideRequest(id);
            setMessage("Booking removed from your history.");
            await loadRequests();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not remove booking.");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await updateRequestStatus(id, status);
            setMessage("Booking status updated.");
            loadRequests();
        } catch (error) {
            setMessage(error.response?.data?.message || "Status update failed.");
        }
    };

    return (
        <>
            {!isAdminRoute && (
                <Navbar user={user} logout={logout} />
            )}

            <MessageAlert
                message={message}
                clearMessage={() => setMessage("")}
            />

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
                        removeFromHistory={removeFromHistory}
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
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FAQ />} />

                <Route path="/admin" element={
                    <OldAdminDashboard user={user} />
                } />

                <Route path="/admin/login" element={
                    <AdminLogin />
                } />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route
                        path="dashboard"
                        element={<AdminDashboard />}
                    />
                    <Route
                        path="users"
                        element={<ManageUsers />}
                    />
                    <Route
                        path="providers"
                        element={<ManageProviders />}
                    />
                    <Route
                        path="services"
                        element={<ManageServices />}
                    />
                    <Route
                        path="bookings"
                        element={<ManageBookings />}
                    />
                </Route>
            </Routes>

            {!isAdminRoute && <Footer />}
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}