import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "glass" | "white" | "template" | "pricing";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "white", ...props }, ref) => {
        const variants = {
            white: "bg-white rounded-2xl border border-gold/15 shadow-[0_3px_18px_rgba(0,0,0,0.05)]",
            glass: "bg-white/30 backdrop-blur-2xl border border-white/45 shadow-lg",
            template: "bg-cream rounded-2xl border border-gold/15 transition-all duration-400 hover:translate-y-[-7px] hover:scale-[1.015] hover:shadow-[0_18px_50px_rgba(0,0,0,0.16)] hover:border-gold/40",
            pricing: "bg-white rounded-[22px] border-2 border-gold/18 shadow-[0_7px_32px_rgba(0,0,0,0.07)] transition-all duration-400 hover:translate-y-[-7px] hover:shadow-[0_18px_55px_rgba(0,0,0,0.12)] hover:border-gold",
        };

        return (
            <div
                ref={ref}
                className={cn(variants[variant], className)}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

export { Card };
