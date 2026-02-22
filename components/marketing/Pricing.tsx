import Link from "next/link";

export default function Pricing() {
    return (
        <section className="pricing" id="pricing">
            <div className="section-header">
                <div className="eyebrow">Simple Pricing</div>
                <h2 className="sec-title">Choose Your Plan</h2>
                <p className="sec-desc">One-time payment. No monthly fees. Active for up to 12 months.</p>
            </div>
            <div className="pricing-grid">
                <div className="price-card">
                    <div className="price-name">Basic</div>
                    <div className="price-amt"><span>₹</span>999</div>
                    <p className="price-sub">Perfect for simple celebrations</p>
                    <ul className="price-ul">
                        <li>Choose from 2 Basic Templates</li>
                        <li>2 Events (Engagement + Wedding)</li>
                        <li>Live Event Photos (Guest Uploads)</li>
                        <li>Basic Family Section</li>
                        <li>WhatsApp Share</li>
                        <li>6 Months Active</li>
                        <li className="opacity-50 line-through">No Live Countdown</li>
                        <li className="opacity-50 line-through">No Music or Video Invite</li>
                        <li className="opacity-50 line-through">No Add to Calendar</li>
                    </ul>
                    <Link href="/checkout/templates?plan=basic" className="price-btn"><span>Choose Basic →</span></Link>
                </div>
                <div className="price-card featured">
                    <div className="price-badge">Most Popular</div>
                    <div className="price-name">Premium</div>
                    <div className="price-amt"><span>₹</span>1,999</div>
                    <p className="price-sub">Everything for a grand wedding</p>
                    <ul className="price-ul">
                        <li>Any Template + Post-Live Editing</li>
                        <li>All Events (Unlimited)</li>
                        <li>Live Event Photos (Guest Uploads)</li>
                        <li>Full Family + Video Invite</li>
                        <li>Premium Background Music</li>
                        <li>Live Countdown &amp; Calendar Save</li>
                        <li>WhatsApp Share + vCard</li>
                        <li>12 Months Active</li>
                    </ul>
                    <Link href="/checkout/templates?plan=premium" className="price-btn"><span>Choose Premium →</span></Link>
                </div>
            </div>
        </section>
    );
}
