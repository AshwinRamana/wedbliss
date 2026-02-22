"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const animateRing = () => {
            setRingPosition((prev) => ({
                x: prev.x + (position.x - prev.x) * 0.13,
                y: prev.y + (position.y - prev.y) * 0.13,
            }));
            requestAnimationFrame(animateRing);
        };

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        window.addEventListener("mousemove", onMouseMove);
        const interactiveElements = document.querySelectorAll('a, button, .template-card, .hero-card, .feat, .price-card');

        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
        });

        const animationFrame = requestAnimationFrame(animateRing);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            cancelAnimationFrame(animationFrame);
            interactiveElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [position.x, position.y]);

    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
        return null;
    }

    return (
        <>
            <div
                className="cursor-dot"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            />
            <div
                className={`cursor-ring ${isHovered ? "hovered" : ""}`}
                style={{
                    left: `${ringPosition.x}px`,
                    top: `${ringPosition.y}px`,
                }}
            />
            <div
                className={`mouse-follower ${isVisible ? "visible" : ""}`}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            >
                <div className="follower-orb" />
            </div>
        </>
    );
}
