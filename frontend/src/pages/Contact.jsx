
import { Mail, Clock, MapPin } from "lucide-react";

export default function Contact() {
    return (
        <section className="min-h-screen bg-[#f5f8f5] px-5 py-16">

            <div className="mx-auto max-w-5xl">

                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[#183d29]">
                        Contact Us
                    </h1>

                    <p className="mt-3 text-gray-600">
                        We're here to help. Contact the FixNear support team.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <Mail className="text-[#247c4b]" size={28} />
                        <h3 className="mt-4 font-bold">Email Us</h3>
                        <a
                            href="mailto:fixnear2026@gmail.com"
                            className="mt-2 block text-sm text-[#247c4b]"
                        >
                            fixnear2026@gmail.com
                        </a>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <Clock className="text-[#247c4b]" size={28} />
                        <h3 className="mt-4 font-bold">Service Hours</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Monday – Saturday
                        </p>
                        <p className="text-sm text-gray-600">
                            9 AM – 6 PM
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <MapPin className="text-[#247c4b]" size={28} />
                        <h3 className="mt-4 font-bold">Our Location</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            CDAC Kharghar, Kharghar, Navi Mumbai, Maharashtra.
                        </p>
                    </div>

                </div>

                <div className="mt-12">
                    <h2 className="mb-5 text-center text-2xl font-bold text-[#183d29]">
                        Find Us on Map
                    </h2>

                    <div className="overflow-hidden rounded-xl shadow-md">
                        <iframe
                            title="CDAC Kharghar Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8425999248493!2d73.05085917497624!3d19.026656282167814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c30013dec4f7%3A0xabeb9000144d6ca1!2sCDAC%20KHARGHAR!5e0!3m2!1sen!2sin!4v1794236722076!5m2!1sen!2sin"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}
