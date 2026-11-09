import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import NavBar from "./components/AppLayout/NavBar/NavBar.jsx";
import HomePage from "./pages/User/HomePage/HomePage.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
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
import ManageCategories from "./adminFrontend/pages/ManageCategories.jsx";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import ManageReviews from "./adminFrontend/pages/ManageReviews.jsx";
function AppContent() {
    const { pathname } = useLocation();
    const isAdminRoute = pathname.startsWith("/admin");
    const isProviderAuthRoute = pathname === "/provider/login" || pathname === "/provider/register";
    const hideNavbarRoutes = [
        "/login",
        "/register",
        "/forgot-password",
        "/verify-otp",
        "/reset-password"
    ];

    const showNavbar =
        !isAdminRoute &&
        !isProviderAuthRoute &&
        !hideNavbarRoutes.includes(pathname);

    return (
        <>
            {showNavbar && <NavBar />}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />

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
                    <Route path="categories" element={<ManageCategories />} />
                    <Route path="reviews" element={<ManageReviews />} />
                </Route>
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<FAQ />} />
                
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
