import Link from "next/link";

export default function Pricing() {
  return (
    <section className="p-section" id="pricing">
      <p className="p-section-label p-reveal">Pricing</p>
      <h2 className="p-section-title p-reveal p-d1">One payment. No monthly fee.</h2>
      <p className="p-section-copy p-reveal p-d2">
        Choose Basic for a clean invite, or Premium for every design plus music, video, and muhurtham countdown.
      </p>

      <div className="p-pricing">
        <article className="p-plan p-reveal p-d1">
          <h3>Basic</h3>
          <div className="price">
            <span>₹</span>999
          </div>
          <p className="blurb">For intimate celebrations that still need a polished link.</p>
          <ul>
            <li>2 classic designs</li>
            <li>Wedding + reception</li>
            <li>Guest photo gallery</li>
            <li>WhatsApp share link</li>
            <li>Live for 6 months</li>
          </ul>
          <Link href="/checkout/templates?plan=basic" className="p-btn p-btn-ghost">
            Start with Basic
          </Link>
        </article>

        <article className="p-plan featured p-reveal p-d2">
          <p className="p-section-label">Most couples choose this</p>
          <h3>Premium</h3>
          <div className="price">
            <span>₹</span>1,999
          </div>
          <p className="blurb">Full experience — all designs, music, video, countdown.</p>
          <ul>
            <li>All designs (incl. Thiruvizha)</li>
            <li>Unlimited events</li>
            <li>Music &amp; video</li>
            <li>Muhurtham countdown</li>
            <li>Live for 12 months</li>
          </ul>
          <Link href="/checkout/templates?plan=premium" className="p-btn p-btn-primary">
            Start with Premium
          </Link>
        </article>
      </div>
    </section>
  );
}
