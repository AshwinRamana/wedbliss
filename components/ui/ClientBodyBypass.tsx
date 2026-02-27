"use client";
import { usePathname } from "next/navigation";
import ClientBody from "./ClientBody";

export default function ClientBodyBypass({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return <>{children}</>;
    }

    return <ClientBody>{children}</ClientBody>;
}
