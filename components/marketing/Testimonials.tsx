const VOICES = [
  {
    q: "Family across three continents opened the same link. Suddenly the wedding felt shared — not mailed.",
    who: "Priya & Karthik · Bengaluru",
  },
  {
    q: "The countdown became a family habit. Every evening someone asked how many days were left.",
    who: "Arun & Kavitha · Chennai",
  },
  {
    q: "Maps, gallery, muhurtham — one place. Guests stopped asking us the same questions twice.",
    who: "Deepa & Rajesh · Mumbai",
  },
];

export default function Testimonials() {
  return (
    <section className="p-section" id="voices">
      <p className="p-section-label p-reveal">Voices</p>
      <h2 className="p-section-title p-reveal p-d1">Spoken, not sold.</h2>
      <div className="p-voices">
        {VOICES.map((v) => (
          <article className="p-quote p-reveal" key={v.who}>
            <blockquote>&ldquo;{v.q}&rdquo;</blockquote>
            <cite>{v.who}</cite>
          </article>
        ))}
      </div>
    </section>
  );
}
