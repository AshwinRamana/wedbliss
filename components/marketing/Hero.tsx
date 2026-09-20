"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import KolamHero from "./KolamHero";

const FALLBACK_PREVIEW = {
  name: "Blossom",
  href: "https://blossom.wedbliss.co/",
  thumb: "/templates/thumbs/blossom.webp",
};

export default function Hero() {
  const [preview, setPreview] = useState(FALLBACK_PREVIEW);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getTemplates } = await import("@/lib/db");
        const list = await getTemplates();
        const live = list.find((t) => t.is_live && t.demo_url && t.thumbnail_url);
        if (!cancelled && live?.demo_url && live.thumbnail_url) {
          setPreview({
            name: live.name,
            href: live.demo_url,
            thumb: live.thumbnail_url,
          });
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="p-hero p-hero-shop" id="top">
      <div className="p-hero-kolam" aria-hidden="true">
        <KolamHero />
      </div>

      <div className="p-hero-grid">
        <div className="p-hero-inner">
          <p className="p-kicker">Digital wedding invitations · Live in minutes</p>
          <h1 className="p-logo-word">
            wed<em>bliss</em>
          </h1>
          <p className="p-hero-line">
            A beautiful invite your guests open on WhatsApp — countdown, maps, gallery, music. One payment. No printing run.
          </p>
          <div className="p-hero-actions">
            <Link href="/checkout/templates?plan=premium" className="p-btn p-btn-primary">
              Create your invite
            </Link>
            <a href="#templates" className="p-btn p-btn-ghost">
              See designs
            </a>
          </div>
          <p className="p-hero-trust">From ₹999 · Share anywhere · Ready the same day</p>
        </div>

        <aside className="p-hero-device" aria-label={`${preview.name} invitation preview`}>
          <a className="p-device p-device-hero" href={preview.href} target="_blank" rel="noopener noreferrer">
            <div className="p-device-notch" aria-hidden="true" />
            <div className="p-portal-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.thumb} alt={`${preview.name} invitation preview`} className="p-hero-thumb" />
            </div>
          </a>
          <a className="p-hero-device-cap" href={preview.href} target="_blank" rel="noopener noreferrer">
            Open live {preview.name} →
          </a>
        </aside>
      </div>
    </header>
  );
}
