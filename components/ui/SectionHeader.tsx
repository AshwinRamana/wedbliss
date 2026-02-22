import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    className?: string;
    align?: "center" | "left";
}

export default function SectionHeader({
    eyebrow,
    title,
    description,
    className,
    align = "center",
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                "max-w-[580px] mb-11",
                align === "center" ? "mx-auto text-center" : "text-left",
                className
            )}
        >
            <div className={cn(
                "mb-2.5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[3px] text-emerald",
                align === "center" ? "justify-center" : "justify-start"
            )}>
                <span className="h-0.5 w-[22px] bg-gradient-to-r from-emerald to-gold" />
                {eyebrow}
                <span className="h-0.5 w-[22px] bg-gradient-to-r from-emerald to-gold" />
            </div>
            <h2 className="mb-3 font-heading text-[clamp(26px,4vw,42px)] font-black leading-[1.22] text-slate">
                {title}
            </h2>
            <p className="text-[15.5px] leading-relaxed text-slate-light">{description}</p>
        </div>
    );
}
