import Link from "next/link";

export default function CTA() {
  return (
    <section className="p-close">
      <h2 className="p-reveal">
        Your invite,
        <br />
        live today.
      </h2>
      <p className="p-section-copy p-reveal p-d1" style={{ margin: "0 auto 1.5rem", textAlign: "center" }}>
        Pick a design, fill the details, share on WhatsApp.
      </p>
      <div className="p-hero-actions p-reveal p-d1">
        <Link href="/checkout/templates?plan=premium" className="p-btn p-btn-primary">
          Create your invite
        </Link>
        <a href="#templates" className="p-btn p-btn-ghost">
          Browse designs
        </a>
      </div>
    </section>
  );
}
