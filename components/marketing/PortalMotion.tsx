"use client";

import { useEffect } from "react";

/** Scroll progress, sticky nav state, reveal-on-enter. No idle cursor glow. */
export default function PortalMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bar = document.getElementById("portal-progress");
    const nav = document.getElementById("portal-nav");
    let lockTimer: number | undefined;

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = window.scrollY / max;
      if (bar) bar.style.width = `${p * 100}%`;
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".p-reveal").forEach((el) => io.observe(el));

    if (!reduce) {
      const hero = document.querySelector(".p-hero");
      lockTimer = window.setTimeout(() => hero?.classList.add("locked"), 2200);
    } else {
      document.querySelector(".p-hero")?.classList.add("locked");
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (lockTimer) window.clearTimeout(lockTimer);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return null;
}
