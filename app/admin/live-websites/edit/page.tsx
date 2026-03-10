"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/ui/Loader";
import EditInvitationForm from "@/components/shared/EditInvitationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function EditAdminInvitationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const rawParams = new URLSearchParams(window.location.search);
        const resolvedId = id || rawParams.get("id");

        if (!resolvedId) {
            // Give Next.js router a moment to hydrate the query params
            const timer = setTimeout(() => {
                setError("No invitation ID provided in the URL.");
                setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }

        const fetchInv = async () => {
            setLoading(true);
            setError(null);
            const { data, error: fetchErr } = await supabase
                .from('invitations')
                .select('*')
                .eq('id', resolvedId)
                .single();

            if (fetchErr || !data) {
                setError("Invitation not found.");
            } else {
                setInvitation(data);
            }
            setLoading(false);
        };
        fetchInv();
    }, [id]);

    if (loading) return <Loader fullScreen text="Loading invitation data..." />;

    return (
        <div className="flex flex-col gap-6">
            <div className="mb-2">
                <Link href="/admin/live-websites" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors uppercase tracking-wider mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Live Websites
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    Edit Invitation Data
                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">ID: {id}</span>
                </h1>
                <p className="text-slate-500 mt-1">Make direct administrative changes to this customer&apos;s live database entry.</p>
            </div>

            {error ? (
                <div className="p-8 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center font-medium">
                    {error}
                </div>
            ) : (
                invitation && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <EditInvitationForm
                            invitationId={invitation.id}
                            initialData={invitation.data}
                            onCancel={() => router.push("/admin/live-websites")}
                        />
                    </div>
                )
            )}
        </div>
    );
}

export default function EditAdminInvitationPage() {
    return (
        <Suspense fallback={<Loader fullScreen text="Loading..." />}>
            <EditAdminInvitationContent />
        </Suspense>
    );
}
