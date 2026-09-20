/** Authentic sikku (chikku) kolam — pulli grid + continuous loops. Clean, legible, not ornamental noise. */
export default function KolamHero({ className }: { className?: string }) {
  // 5×5 pulli, 36px spacing, origin at center 200,200
  const S = 36;
  const dots: { x: number; y: number }[] = [];
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      dots.push({ x: 200 + c * S, y: 200 + r * S });
    }
  }

  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" aria-hidden="true">
      {/* Soft ground ring — single, deliberate */}
      <circle className="k-ground" cx="200" cy="200" r="168" />

      {/* Continuous sikku loops — four cardinal petals through pulli */}
      <g className="k-sikku">
        <path d="M200 128
          C236 128 272 164 272 200
          C272 236 236 272 200 272
          C164 272 128 236 128 200
          C128 164 164 128 200 128Z" />
        <path d="M200 92
          C254 92 308 146 308 200
          C308 254 254 308 200 308
          C146 308 92 254 92 200
          C92 146 146 92 200 92Z" />
        {/* Diamond weave */}
        <path d="M200 128 L272 200 L200 272 L128 200 Z" />
        {/* Corner loops around outer pullis */}
        <path d="M128 128
          C146 110 164 110 182 128
          C164 146 146 146 128 128Z" />
        <path d="M272 128
          C254 110 236 110 218 128
          C236 146 254 146 272 128Z" />
        <path d="M272 272
          C254 290 236 290 218 272
          C236 254 254 254 272 272Z" />
        <path d="M128 272
          C146 290 164 290 182 272
          C164 254 146 254 128 272Z" />
        {/* Cardinal petal loops */}
        <path d="M200 56
          C218 74 218 110 200 128
          C182 110 182 74 200 56Z" />
        <path d="M344 200
          C326 218 290 218 272 200
          C290 182 326 182 344 200Z" />
        <path d="M200 344
          C182 326 182 290 200 272
          C218 290 218 326 200 344Z" />
        <path d="M56 200
          C74 182 110 182 128 200
          C110 218 74 218 56 200Z" />
      </g>

      {/* Pulli — rice-flour dots */}
      {dots.map((d, i) => (
        <circle key={i} className="k-pulli" cx={d.x} cy={d.y} r={i === 12 ? 3.2 : 2.4} />
      ))}

      {/* Center lamp spark */}
      <circle className="k-heart" cx="200" cy="200" r="4.5" />
      <path
        className="k-flame"
        d="M200 186 C204 192 204 197 200 201 C196 197 196 192 200 186Z"
      />
    </svg>
  );
}
