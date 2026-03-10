"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Loader from "@/components/ui/Loader";
import EditInvitationForm from "@/components/shared/EditInvitationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function EditUserInvitationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchInv = async () => {
            setLoading(true);
            setError(null);
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData.session?.user;

            if (!user) {
                router.push("/login");
                return;
            }

            const { data, error: fetchErr } = await supabase
                .from('invitations')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchErr || !data) {
                setError("Invitation not found.");
            } else if (data.user_email !== user.email) {
                setError("You do not have permission to edit this invitation.");
            } else {
                setInvitation(data);
            }
            setLoading(false);
        };
        fetchInv();
    }, [id, router]);

    if (loading) return <Loader fullScreen text="Loading invitation data..." />;

    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #fffbf5 0%, #fff8ed 55%, #fef3e2 100%)" }}>
            <Nav />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-28 pb-16 relative z-10">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors uppercase tracking-wider mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="font-serif text-3xl md:text-5xl font-black text-slate-800">Edit Invitation</h1>
                    <p className="text-slate-500 mt-2">Update names, events, photos, and videos for your live invitation.</p>
                </div>

                {error ? (
                    <div className="p-8 bg-red-50 text-red-700 rounded-3xl border border-red-200 text-center font-medium">
                        {error}
                    </div>
                ) : (
                    invitation && (
                        <EditInvitationForm
                            invitationId={invitation.id}
                            initialData={invitation.data}
                            onCancel={() => router.push("/dashboard")}
                        />
                    )
                )}
            </main>

            <Footer />
        </div>
    );
}

export default function EditUserInvitationPage() {
    return (
        <Suspense fallback={<Loader fullScreen text="Loading..." />}>
            <EditUserInvitationContent />
        </Suspense>
    );
}
