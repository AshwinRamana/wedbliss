import Link from "next/link";

export default function Contact() {
  return (
    <section className="p-section" id="contact">
      <p className="p-section-label p-reveal">Contact</p>
      <h2 className="p-section-title p-reveal p-d1">We&apos;re one message away.</h2>
      <p className="p-section-copy p-reveal p-d2">
        Questions on designs, billing, or setup — reach us directly. No ticket maze.
      </p>

      <div className="p-contact p-reveal p-d2">
        <a href="mailto:info@wedbliss.co" className="p-contact-line">
          <span>Email</span>
          <strong>info@wedbliss.co</strong>
        </a>
        <a href="tel:+918122357677" className="p-contact-line">
          <span>Phone</span>
          <strong>+91 81223 57677</strong>
        </a>
        <div className="p-contact-line">
          <span>Based</span>
          <strong>Tamil Nadu · serving worldwide</strong>
        </div>
      </div>

      <div className="p-contact-links p-reveal p-d3">
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
    </section>
  );
}
