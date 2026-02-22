"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientBody({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Custom cursor
        const dot = document.getElementById("cursorDot");
        const ring = document.getElementById("cursorRing");
        const follower = document.getElementById("mouseFollower");
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        if (window.matchMedia("(pointer:fine)").matches) {
            document.addEventListener("mousemove", (e) => {
                mx = e.clientX; my = e.clientY;
                if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
                if (follower) { follower.style.left = mx + "px"; follower.style.top = my + "px"; follower.classList.add("visible"); }
            });
            (function animRing() {
                rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
                if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
                requestAnimationFrame(animRing);
            })();
            document.querySelectorAll("a,button,.template-card,.hero-card,.feat,.price-card").forEach((el) => {
                el.addEventListener("mouseenter", () => ring && ring.classList.add("hovered"));
                el.addEventListener("mouseleave", () => ring && ring.classList.remove("hovered"));
            });
        }

        // Nav scroll
        window.addEventListener("scroll", () => {
            const nav = document.getElementById("nav");
            if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
        }, { passive: true });

        // Smooth scroll listener for anchor links
        const handleAnchorClick = (e: Event) => {
            const a = e.currentTarget as HTMLAnchorElement;
            const href = a.getAttribute("href");
            if (href === "#" || !href) return;
            if (href.startsWith("#")) {
                e.preventDefault();
                const t = document.querySelector(href);
                if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener("click", handleAnchorClick);
        });

    }, []);

    // ─── MOUNTED DOM CONTEXT RUNNER (Runs on route change) ───
    useEffect(() => {
        // 1. Scroll animations (Trigger once and stay visible)
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("in");
                    observer.unobserve(e.target); // Stop observing once it's faded in!
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(".fade-in,.step").forEach((el) => obs.observe(el));

        // 2. TRENDY 3D COVERFLOW CAROUSEL
        let autoTimer: ReturnType<typeof setInterval> | null = null;
        const initCarousel = () => {
            const wrapper = document.querySelector<HTMLElement>(".hero-cards-wrapper");
            const track = document.getElementById("heroCarousel") as HTMLElement | null;
            if (!wrapper || !track || window.innerWidth > 860) return;

            const slides = Array.from(
                track.querySelectorAll<HTMLElement>(":scope > .carousel-slide")
            );
            if (slides.length === 0) return;

            const total = slides.length;
            let currentIdx = 0;
            let startX = 0;
            let isDragging = false;

            const updatePositions = () => {
                slides.forEach((slide, i) => {
                    let diff = i - currentIdx;
                    if (diff > total / 2) diff -= total;
                    if (diff < -total / 2) diff += total;

                    let translateX = 0, translateZ = 0, rotateY = 0, opacity = 1, zIndex = 10;

                    if (diff === 0) {
                        translateX = 0; translateZ = 0; rotateY = 0; opacity = 1; zIndex = 10;
                    } else if (diff === 1 || diff === -3) {
                        translateX = 65; translateZ = -60; rotateY = -12; opacity = 0.8; zIndex = 5;
                    } else if (diff === -1 || diff === 3) {
                        translateX = -65; translateZ = -60; rotateY = 12; opacity = 0.8; zIndex = 5;
                    } else {
                        translateX = 0; translateZ = -140; rotateY = 0; opacity = 0; zIndex = 1;
                    }

                    slide.style.transform = `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
                    slide.style.opacity = opacity.toString();
                    slide.style.zIndex = zIndex.toString();

                    const card = slide.querySelector<HTMLElement>(".carousel-card");
                    if (card) card.classList.toggle("active", diff === 0);
                });
            };

            const next = () => { currentIdx = (currentIdx + 1) % total; updatePositions(); };
            const prev = () => { currentIdx = (currentIdx - 1 + total) % total; updatePositions(); };

            updatePositions();

            wrapper.addEventListener("touchstart", (e) => {
                isDragging = true;
                startX = (e as TouchEvent).touches[0].clientX;
                if (autoTimer) clearInterval(autoTimer);
            }, { passive: true });

            wrapper.addEventListener("touchend", (e) => {
                if (!isDragging) return;
                isDragging = false;
                const endX = (e as TouchEvent).changedTouches[0].clientX;
                const dx = endX - startX;
                if (dx < -40) next();
                else if (dx > 40) prev();
                startAutoPlay();
            });

            const startAutoPlay = () => {
                if (autoTimer) clearInterval(autoTimer);
                autoTimer = setInterval(next, 3500);
            };
            startAutoPlay();
        };

        if (pathname === "/" || pathname === "") {
            initCarousel();
        }

        return () => {
            obs.disconnect();
            if (autoTimer) clearInterval(autoTimer);
        };
    }, [pathname]);

    return <>{children}</>;
}
