/** Small ritual glyphs for How steps — single-stroke, calm. */
export function GlyphChoose({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="60" cy="60" r="18" stroke="currentColor" strokeWidth="1.2" />
      <path d="M60 22 L68 38 L60 42 L52 38 Z M98 60 L82 68 L78 60 L82 52 Z M60 98 L52 82 L60 78 L68 82 Z M22 60 L38 52 L42 60 L38 68 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
    </svg>
  );
}

export function GlyphFill({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <rect x="28" y="22" width="64" height="76" rx="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M40 42 H76 M40 56 H76 M40 70 H64" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="80" cy="88" r="10" stroke="currentColor" strokeWidth="1.3" />
      <path d="M76 88 L79 91 L86 84" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlyphOpen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M36 96 V40 L60 24 L84 40 V96" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M48 96 V52 H72 V96" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="66" cy="74" r="2.2" fill="currentColor" />
      <path d="M60 18 C63 24 63 30 60 34 C57 30 57 24 60 18Z" fill="#C41E3A" />
      <path d="M52 38 C55 34 58 33 60 33 C62 33 65 34 68 38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
