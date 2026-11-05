import { Link } from "react-router-dom";

export default function Login({ login }) {
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