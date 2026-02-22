// Feature icons as clean inline SVGs — no emojis, no Tailwind dynamic class purge risk
// Using inline style for backgrounds to avoid Tailwind purging dynamic class strings

const FEATURES = [
    {
        title: "Live Countdown",
        sub: "Real-time ticker to the muhurtham",
        bg: "linear-gradient(135deg, #f43f5e, #f97316)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15.5 14" />
            </svg>
        ),
    },
    {
        title: "Custom Domain",
        sub: "Your own link like siva-hema.wedbliss.co",
        bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9" />
                <path d="M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" />
                <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
        ),
    },
    {
        title: "Video Invite",
        sub: "A personal message from the couple",
        bg: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        ),
    },
    {
        title: "Interactive Maps",
        sub: "Venue directions, one tap away",
        bg: "linear-gradient(135deg, #10b981, #14b8a6)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
    },
    {
        title: "Calendar Save",
        sub: "Google Calendar & iCal export",
        bg: "linear-gradient(135deg, #f59e0b, #eab308)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {/* Calendar border + header bar */}
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                {/* Date dots using circles (most reliable SVG method) */}
                <circle cx="8" cy="15" r="1" fill="white" stroke="none" />
                <circle cx="12" cy="15" r="1" fill="white" stroke="none" />
                <circle cx="16" cy="15" r="1" fill="white" stroke="none" />
                <circle cx="8" cy="19" r="1" fill="white" stroke="none" />
                <circle cx="12" cy="19" r="1" fill="white" stroke="none" />
            </svg>
        ),
    },
    {
        title: "Live Event Photos",
        sub: "Guests upload, everyone sees instantly",
        bg: "linear-gradient(135deg, #ec4899, #f43f5e)",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
            </svg>
        ),
    },
];

export default function Features() {
    return (
        <section className="features-section" id="features">
            <div className="features-inner">
                <div className="features-header">
                    <div className="eyebrow">Platform Features</div>
                    <h2 className="sec-title">Everything your wedding invite needs</h2>
                    <p className="sec-desc">From live countdowns to personalized domains — every feature is thoughtfully crafted to make your special day unforgettable.</p>
                </div>

                <div className="features-grid">
                    {FEATURES.map((f, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feat-icon-wrap" style={{ background: f.bg }}>
                                {f.icon}
                            </div>
                            <div className="feat-body">
                                <div className="feat-title">{f.title}</div>
                                <div className="feat-sub">{f.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
