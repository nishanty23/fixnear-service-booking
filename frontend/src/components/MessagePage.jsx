import { Link } from "react-router-dom";

export default function MessagePage({ title, text }) {
    return (
        <section className="info-page">
            <h1>{title}</h1>
            <p>{text}</p>
            <Link to="/login" className="btn btn-primary">Login</Link>
        </section>
    );
}
