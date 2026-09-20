import { GlyphChoose, GlyphFill, GlyphOpen } from "./RitualGlyphs";

const STEPS = [
  {
    n: "01",
    title: "Pick a design",
    copy: "Noir, Gravity, Blossom, Thiruvizha — open any live preview, then claim it.",
    Glyph: GlyphChoose,
  },
  {
    n: "02",
    title: "Add your details",
    copy: "Names, parents, events, photos, a short note. We keep the form short on purpose.",
    Glyph: GlyphFill,
  },
  {
    n: "03",
    title: "Share the link",
    copy: "Pay once, get your live invite, send it on WhatsApp. Guests have everything in one place.",
    Glyph: GlyphOpen,
  },
];

export default function HowItWorks() {
  return (
    <section className="p-section p-how-compact" id="how">
      <p className="p-section-label p-reveal">How it works</p>
      <h2 className="p-section-title p-reveal p-d1">Three steps. Done today.</h2>
      <div className="p-how-grid">
        {STEPS.map((s) => (
          <article className="p-how-card p-reveal" key={s.n}>
            <s.Glyph className="p-how-glyph" />
            <p className="p-section-label">{s.n}</p>
            <h3>{s.title}</h3>
            <p>{s.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
