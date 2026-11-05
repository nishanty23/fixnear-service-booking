import { Link } from "react-router-dom";

export default function Register({ register }) {
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