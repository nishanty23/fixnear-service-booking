import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import NavBar from "./components/AppLayout/NavBar/NavBar.jsx";
import HomePage from "./pages/User/HomePage/HomePage.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Bookings from "./pages/Bookings.jsx";
import Services from "./pages/Services.jsx";
import ServiceDetails from "./pages/ServiceDetails.jsx";
import Account from "./pages/Account.jsx";
import ProviderAuth from "./pages/ProviderAuth.jsx";
import ProviderDashboardPage from "./pages/ProviderDashboardPage.jsx";
import BecomeProvider from "./pages/BecomeProvider.jsx";
import AdminLogin from "./adminFrontend/pages/AdminLogin.jsx";
import AdminLayout from "./adminFrontend/layouts/AdminLayout.jsx";
import AdminDashboard from "./adminFrontend/pages/AdminDashboard.jsx";
import ManageUsers from "./adminFrontend/pages/ManageUsers.jsx";
import ManageProviders from "./adminFrontend/pages/ManageProviders.jsx";
import ManageServices from "./adminFrontend/pages/ManageServices.jsx";
import ManageBookings from "./adminFrontend/pages/ManageBookings.jsx";
function AppContent() {
    const { pathname } = useLocation();
    const isAdminRoute = pathname.startsWith("/admin");
    const isProviderAuthRoute = pathname === "/provider/login" || pathname === "/provider/register";
    const showNavbar = !isAdminRoute && !isProviderAuthRoute && pathname !== "/login" && pathname !== "/register";

    return (
        <>
            {showNavbar && <NavBar />}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/provider/login" element={<ProviderAuth mode="login" />} />
                <Route path="/provider/register" element={<BecomeProvider />} />
                <Route path="/provider/dashboard" element={<ProviderDashboardPage />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetails />} />
                <Route path="/account" element={<Account />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="providers" element={<ManageProviders />} />
                    <Route path="services" element={<ManageServices />} />
                    <Route path="bookings" element={<ManageBookings />} />
                </Route>
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <LocationProvider>
                <AppContent />
            </LocationProvider>
        </BrowserRouter>
    );
}
