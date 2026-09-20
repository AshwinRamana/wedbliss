"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import BrandMark from "./BrandMark";
import "@/app/(marketing)/marketing.css";

const LIGHT_PREFIXES = ["/checkout", "/dashboard", "/login", "/signup", "/privacy", "/terms", "/refunds"];

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const light = LIGHT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    fetchSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const links = light
    ? [
        { href: "/#templates", label: "Designs" },
        { href: "/#pricing", label: "Pricing" },
        { href: "/#contact", label: "Contact" },
      ]
    : [
        { href: "#templates", label: "Designs" },
        { href: "#pricing", label: "Pricing" },
        { href: "#how", label: "How it works" },
        { href: "#questions", label: "Questions" },
        { href: "#contact", label: "Contact" },
      ];

  const cta = user ? (
    <Link href="/dashboard" className="p-nav-cta" onClick={() => setMenuOpen(false)}>
      Dashboard
    </Link>
  ) : (
    <Link href="/checkout/templates?plan=premium" className="p-nav-cta" onClick={() => setMenuOpen(false)}>
      Begin
    </Link>
  );

  return (
    <>
      <a href="#templates" className="p-skip">
        Skip to designs
      </a>
      <nav className={`p-nav${light ? " light" : ""}`} id="portal-nav" aria-label="Primary">
        <Link href="/" className="p-brand" aria-label="Wedbliss home">
          <BrandMark className="p-brand-mark" />
          <span>
            wed<em>bliss</em>
          </span>
        </Link>

        <div className="p-nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          {cta}
        </div>

        <button
          type="button"
          className="p-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="portal-drawer"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
        </button>
      </nav>

      <div
        id="portal-drawer"
        className={`p-drawer ${menuOpen ? "open" : ""}${light ? " light" : ""}`}
        aria-hidden={!menuOpen}
      >
        <button type="button" className="p-drawer-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
          ×
        </button>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
        {cta}
      </div>
    </>
  );
}
