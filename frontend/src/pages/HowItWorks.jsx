const steps = [
    { number: "01", icon: "🔎", title: "Choose what you need", text: "Explore service categories or search for a specific home service." },
    { number: "02", icon: "📝", title: "Share the details", text: "Select a service, describe the issue, enter your address and choose an appointment time." },
    { number: "03", icon: "🤝", title: "Provider responds", text: "Your request is sent to the service provider, who can accept or reject it." },
    { number: "04", icon: "✅", title: "Track completion", text: "Follow the booking status and share a review after the work is completed." }
];

export default function HowItWorks() {
    return (
        <main className="content-page">
            <section className="page-hero">
                <span className="eyebrow">SIMPLE FROM START TO FINISH</span>
                <h1>How FixNear works</h1>
                <p>Getting reliable help for your home takes just a few simple steps.</p>
            </section>
            <section className="section">
                <div className="steps-grid steps-grid-four">
                    {steps.map(step => (
                        <article className="step-card" key={step.number}>
                            <span>{step.number}</span><div>{step.icon}</div>
                            <h3>{step.title}</h3><p>{step.text}</p>
                        </article>
                    ))}
                </div>
            </section>
            <section className="info-highlight">
                <h2>One place for everyday home needs.</h2>
                <p>Customers can book and track requests. Service providers can manage incoming work and update progress from their dashboard.</p>
            </section>
        </main>
    );
}