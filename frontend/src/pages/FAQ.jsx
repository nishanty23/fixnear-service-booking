const questions = [
    ["How do I book a service?", "Browse services on the home page, select Book Now, provide your issue and address, choose an appointment time and confirm the request."],
    ["Can a service provider book a service?", "No. Booking is available only to customer accounts. Service providers use their dashboard to manage incoming customer requests."],
    ["How can I track my booking?", "Log in with your customer account and open My Bookings. The status is updated as the provider accepts, starts and completes the work."],
    ["Can I cancel a booking?", "You can cancel a booking while it is pending or accepted. Requests that are already in progress or completed cannot be cancelled through the customer page."],
    ["When can I submit a review?", "You can submit a rating and comment after the booking status becomes Completed."],
    ["Can I remove an old booking from my history?", "Completed and cancelled bookings can be hidden from your history. The underlying booking record is retained by the system."]
];

export default function FAQ() {
    return (
        <main className="content-page">
            <section className="page-hero">
                <span className="eyebrow">NEED A HAND?</span>
                <h1>Frequently asked questions</h1>
                <p>Quick answers to common questions about using FixNear.</p>
            </section>
            <section className="faq-list">
                {questions.map(([question, answer]) => (
                    <details className="faq-item" key={question}>
                        <summary>{question}<span>＋</span></summary>
                        <p>{answer}</p>
                    </details>
                ))}
            </section>
        </main>
    );
}