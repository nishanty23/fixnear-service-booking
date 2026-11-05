import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-main">
                <div><h2>FixNear<span>.</span></h2><p>Reliable local services, right around the corner.</p></div>
                <div className="footer-links"><Link to="/how-it-works">How It Works</Link><Link to="/faq">FAQs</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
            </div>
            <p className="footer-bottom">© 2026 FixNear. All rights reserved.</p>
        </footer>
    );
}