import Image from "next/image";

export default function Loader({ text = "Loading...", fullScreen = false }: { text?: string, fullScreen?: boolean }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-5 p-8">
            {/* Logo Icon with pulse + spin ring animation */}
            <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
                {/* Outer rotating ring */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: "2.5px solid transparent",
                        borderTopColor: "#047857",
                        borderRightColor: "#D4AF37",
                        animation: "spin 1.2s linear infinite",
                    }}
                />
                {/* Inner subtle track */}
                <div
                    className="absolute rounded-full"
                    style={{
                        inset: "6px",
                        border: "1.5px solid rgba(4,120,87,0.10)",
                    }}
                />
                {/* WedBliss logo icon centered */}
                <div
                    className="relative z-10 flex items-center justify-center"
                    style={{
                        animation: "wedbliss-pulse 2s ease-in-out infinite",
                        inset: "10px",
                        position: "absolute",
                    }}
                >
                    <Image
                        src="/Brand logo.png"
                        alt="WedBliss"
                        width={44}
                        height={44}
                        className="object-contain"
                        style={{ width: 44, height: 44 }}
                        priority
                    />
                </div>
            </div>

            {text && (
                <p className="text-xs font-bold text-emerald-700 tracking-widest uppercase" style={{ animation: "wedbliss-pulse 2s ease-in-out infinite" }}>
                    {text}
                </p>
            )}

            <style>{`
                @keyframes wedbliss-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.95); }
                }
            `}</style>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}
