import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-[#163d29] px-[8%] py-[35px] text-center text-[#dce9df]">
            <div className="flex flex-col items-start justify-between gap-6 text-left sm:flex-row sm:items-center">
                <div>
                    <h2 className="m-0 font-[Manrope,sans-serif] text-2xl font-bold text-white">
                        FixNear<span className="text-[#55a879]">.</span>
                    </h2>
                    <p className="mt-2 text-xs text-[#b7cbbd]">
                        Reliable local services, right around the corner.
                    </p>
                </div>
                <div className="flex flex-wrap gap-[14px] sm:gap-[22px]">
                    <Link className="text-[13px] text-[#dce9df] hover:text-white hover:underline" to="/how-it-works">How It Works</Link>
                    <Link className="text-[13px] text-[#dce9df] hover:text-white hover:underline" to="/faq">FAQs</Link>
                    <Link className="text-[13px] text-[#dce9df] hover:text-white hover:underline" to="/about">About</Link>
                    <Link className="text-[13px] text-[#dce9df] hover:text-white hover:underline" to="/contact">Contact</Link>
                </div>
            </div>
            <p className="mt-7 border-t border-white/10 pt-[18px] text-xs text-[#b7cbbd]">
                © 2026 FixNear. All rights reserved.
            </p>
        </footer>
    );
}