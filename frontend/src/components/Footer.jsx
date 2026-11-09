
import { Link } from "react-router-dom";
import {
    MapPin,
    Mail,
    Clock,
    ArrowRight,
    Globe,
    Camera,
    BriefcaseBusiness,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#102f20] text-[#dce9df]">

            {/* Main Footer */}
            <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand Section */}
                    <div>
                        <Link to="/" className="inline-block">
                            <h2 className="text-3xl font-extrabold tracking-tight text-white">
                                Fix<span className="text-[#42b883]">Near</span>
                                <span className="text-[#42b883]">.</span>
                            </h2>
                        </Link>

                        <p className="mt-4 max-w-xs text-sm leading-7 text-[#b7cbbd]">
                            Your trusted platform for finding and booking
                            reliable local service professionals.
                            Quality services, just around the corner.
                        </p>

                        {/* Social / Useful Links */}
                        <div className="mt-5 flex gap-3">
                            <a
                                href="#"
                                aria-label="Website"
                                className="rounded-full bg-white/10 p-2.5 transition hover:bg-[#42b883] hover:text-white"
                            >
                                <Globe size={18} />
                            </a>

                            <a
                                href="#"
                                aria-label="Photos"
                                className="rounded-full bg-white/10 p-2.5 transition hover:bg-[#42b883] hover:text-white"
                            >
                                <Camera size={18} />
                            </a>

                            <a
                                href="#"
                                aria-label="Professional Network"
                                className="rounded-full bg-white/10 p-2.5 transition hover:bg-[#42b883] hover:text-white"
                            >
                                <BriefcaseBusiness size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-5 text-lg font-bold text-white">
                            Quick Links
                        </h3>

                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/" className="transition hover:text-[#42b883]">
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link to="/services" className="transition hover:text-[#42b883]">
                                    Explore Services
                                </Link>
                            </li>

                            <li>
                                <Link to="/how-it-works">
                                    How It Works
                                </Link>
                            </li>

                            <li>
                                <Link to="/about" className="transition hover:text-[#42b883]">
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Link to="/contact" className="transition hover:text-[#42b883]">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Help & Support */}
                    <div>
                        <h3 className="mb-5 text-lg font-bold text-white">
                            Help & Support
                        </h3>

                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/faq">
                                    Frequently Asked Questions
                                </Link> 
                            </li>

                            <li>
                                <Link to="/contact" className="transition hover:text-[#42b883]">
                                    Customer Support
                                </Link>
                            </li>

                            <li>
                                <Link to="/become-provider" className="transition hover:text-[#42b883]">
                                    Become a Service Provider
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="mb-5 text-lg font-bold text-white">
                            Get in Touch
                        </h3>

                        <div className="space-y-4 text-sm">

                            <div className="flex items-start gap-3">
                                <MapPin
                                    size={19}
                                    className="mt-1 shrink-0 text-[#42b883]"
                                />

                                <p className="leading-6 text-[#b7cbbd]">
                                    Kharghar, Navi Mumbai,
                                    Maharashtra, India
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail
                                    size={19}
                                    className="mt-1 shrink-0 text-[#42b883]"
                                />

                                <a
                                    href="mailto:fixnear2026@gmail.com"
                                    className="break-all transition hover:text-[#42b883]"
                                >
                                    fixnear2026@gmail.com
                                </a>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock
                                    size={19}
                                    className="mt-1 shrink-0 text-[#42b883]"
                                />

                                <p className="leading-6 text-[#b7cbbd]">
                                    Monday – Saturday
                                    <br />
                                    9:00 AM – 6:00 PM
                                </p>
                            </div>

                            <Link
                                to="/contact"
                                className="mt-2 inline-flex items-center gap-2 font-semibold text-[#42b883] transition hover:gap-3"
                            >
                                Contact Us
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-center text-xs text-[#a9c0b0] md:flex-row md:px-10">

                    <p>
                        © {new Date().getFullYear()} FixNear. All rights reserved.
                    </p>

                    <p>
                        Made with <span className="text-red-400">♥</span> for better local services.
                    </p>

                </div>
            </div>

        </footer>
    );
}
