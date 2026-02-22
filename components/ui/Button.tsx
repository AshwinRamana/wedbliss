import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "white";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-gradient-to-br from-emerald to-emerald-light text-white shadow-[0_4px_14px_rgba(4,120,87,0.3)] hover:shadow-[0_6px_20px_rgba(4,120,87,0.4)] before:bg-gradient-to-br before:from-gold before:to-amber",
            secondary: "bg-white text-emerald border-2 border-emerald hover:bg-emerald hover:text-white shadow-[0_3px_12px_rgba(0,0,0,0.07)]",
            outline: "bg-transparent text-white border-2 border-white/65 hover:bg-white/10",
            ghost: "bg-transparent text-slate hover:bg-emerald/5",
            white: "bg-white text-slate shadow-lg hover:bg-white/90",
        };

        const sizes = {
            sm: "px-4 py-2 text-xs",
            md: "px-5 py-2.5 text-sm",
            lg: "px-7 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {variant === "primary" && (
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-gold to-amber" />
                )}
                <span className="relative z-10 flex items-center gap-2">{props.children}</span>
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
