import { Link } from "react-router-dom";

export default function Navbar({ user, logout }) {
    return (
        <header className="navbar">
            <Link to="/" className="logo">FixNear<span>.</span></Link>

            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About Us</Link>
                <Link to="/how-it-works">How It Works</Link>
                <Link to="/faq">FAQ</Link>
                <Link to="/contact">Contact</Link>

                {user?.role === "USER" && <Link to="/bookings">My Bookings</Link>}
                {user?.role === "SERVICE_PROVIDER" && <Link to="/dashboard">Provider Dashboard</Link>}
                {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
            </nav>

            <div className="nav-actions">
                {user ? (
                    <>
                        <span className="welcome">Hi, {user.name}</span>
                        <button className="btn btn-outline" onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-outline">Login</Link>
                        <Link to="/register" className="btn btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </header>
    );
}