export default function DomainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // We explicitly do NOT include the Nav bar here because these are standalone wedding sites
    return (
        <div className="w-full min-h-screen">
            {children}
        </div>
    );
}
