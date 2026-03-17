import Link from "next/link";

export default function Pricing() {
    return (
        <section className="pricing" id="pricing">
            <div className="section-header">
                <div className="eyebrow">Your Celebration, Your Way</div>
                <h2 className="sec-title">Simple, Transparent Pricing</h2>
                <p className="sec-desc">A one-time investment for a lifetime of memories. No subscriptions, just joy.</p>
            </div>
            <div className="pricing-grid">
                <div className="price-card">
                    <div className="price-name">Basic</div>
                    <div className="price-amt"><span>₹</span>999</div>
                    <p className="price-sub">Perfect for simple, elegant celebrations</p>
                    <ul className="price-ul">
                        <li>Choose from 2 Classic Templates</li>
                        <li>Essential Events (Wedding + Reception)</li>
                        <li>Guest Photo Gallery (Unlimited Uploads)</li>
                        <li>Digital RSVP & Guest List</li>
                        <li>Instant WhatsApp Sharing</li>
                        <li>6 Months Active Link</li>
                        <li className="opacity-50 line-through">Background Music & Video</li>
                        <li className="opacity-50 line-through">Muhurtham Countdown</li>
                    </ul>
                    <Link href="/checkout/templates?plan=basic" className="price-btn"><span>Choose Basic →</span></Link>
                </div>
                <div className="price-card featured">
                    <div className="price-badge">Recommended</div>
                    <div className="price-name">Premium</div>
                    <div className="price-amt"><span>₹</span>1,999</div>
                    <p className="price-sub">The complete digital experience for your big day</p>
                    <ul className="price-ul">
                        <li>Access to <strong>All</strong> Templates</li>
                        <li>Unlimited Events (Sangeet, Mehendi, etc.)</li>
                        <li>Guest Photo Gallery (Unlimited Uploads)</li>
                        <li>Immersive Background Music</li>
                        <li>Personal Video Invitation</li>
                        <li>Muhurtham Countdown & Calendar Sync</li>
                        <li>Priority WhatsApp Support</li>
                        <li>12 Months Active Link</li>
                    </ul>
                    <Link href="/checkout/templates?plan=premium" className="price-btn"><span>Choose Premium →</span></Link>
                </div>
            </div>
        </section>
    );
}
