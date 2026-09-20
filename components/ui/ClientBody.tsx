"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientBody({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Smooth scroll for in-page anchors only
        const handleAnchorClick = (e: Event) => {
            const a = e.currentTarget as HTMLAnchorElement;
            const href = a.getAttribute("href");
            if (!href || href === "#" || !href.startsWith("#")) return;
            e.preventDefault();
            const t = document.querySelector(href);
            if (t) {
                const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!a.closest(".wb-still");
                t.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
            }
        };

        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener("click", handleAnchorClick);
        });

        return () => {
            document.querySelectorAll('a[href^="#"]').forEach((a) => {
                a.removeEventListener("click", handleAnchorClick);
            });
        };
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("in");
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(".fade-in,.step").forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [pathname]);

    return <>{children}</>;
}
