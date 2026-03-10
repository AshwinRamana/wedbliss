"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Video, Image as ImageIcon, CheckCircle, Save } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditInvitationForm({ invitationId, initialData, onSave, onCancel }: { invitationId: string, initialData: any, onSave?: () => void, onCancel?: () => void }) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ── Couple & Parents ──
    const [brideFirst, setBrideFirst] = useState(initialData?.couple?.bride?.firstName || "");
    const [brideFather, setBrideFather] = useState(initialData?.couple?.bride?.fatherName || "");
    const [brideMother, setBrideMother] = useState(initialData?.couple?.bride?.motherName || "");
    const [groomFirst, setGroomFirst] = useState(initialData?.couple?.groom?.firstName || "");
    const [groomFather, setGroomFather] = useState(initialData?.couple?.groom?.fatherName || "");
    const [groomMother, setGroomMother] = useState(initialData?.couple?.groom?.motherName || "");

    // ── Events (add/remove) ──
    const [eventsList, setEventsList] = useState(initialData?.events || [
        { id: "ev-1", title: "Wedding / Muhurtham", date: "", startTime: "", endTime: "", venueName: "", googleMapsUrl: "" },
    ]);

    const handleEventChange = (index: number, field: string, value: string) => {
        const newEvents = [...eventsList];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEventsList(newEvents);
    };

    const addEvent = () => {
        setEventsList([...eventsList, { id: `ev-${Date.now()}`, title: "", date: "", startTime: "", endTime: "", venueName: "", googleMapsUrl: "" }]);
    };

    const removeEvent = (index: number) => {
        const newEvents = [...eventsList];
        newEvents.splice(index, 1);
        setEventsList(newEvents);
    };

    // ── Notes from Couple ──
    const [brideNotes, setBrideNotes] = useState(initialData?.couple?.bride?.notes || "");
    const [groomNotes, setGroomNotes] = useState(initialData?.couple?.groom?.notes || "");

    // ── Media ──
    const [videoUrl, setVideoUrl] = useState(initialData?.media?.videoUrl || "");
    const [videoUploading, setVideoUploading] = useState(false);
    const [photos, setPhotos] = useState<string[]>(initialData?.gallery?.images || []);
    const [uploading, setUploading] = useState(false);

    const getCoupleName = () => `${brideFirst}-${groomFirst}`.toLowerCase();

    // ── S3 Upload Handlers ──
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        if (photos.length >= 3) { alert("Maximum 3 portrait photos allowed."); return; }

        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) { alert("File must be less than 5MB"); return; }

        setUploading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/upload/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&couplename=${encodeURIComponent(getCoupleName())}`);
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to generate upload URL");

            const uploadRes = await fetch(data.signedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
            if (!uploadRes.ok) throw new Error("Failed to upload to S3");
            setPhotos(prev => [...prev, data.publicUrl]);
        } catch (err: unknown) {
            alert("Upload error: " + (err instanceof Error ? err.message : String(err)));
        }
        setUploading(false);
        e.target.value = '';
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        if (file.size > 30 * 1024 * 1024) { alert("Video must be less than 30MB."); return; }

        setVideoUploading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/upload/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&couplename=${encodeURIComponent(getCoupleName())}`);
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to generate upload URL");

            const uploadRes = await fetch(data.signedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
            if (!uploadRes.ok) throw new Error("Failed to upload video to S3");
            setVideoUrl(data.publicUrl);
        } catch (err: unknown) {
            alert("Video upload error: " + (err instanceof Error ? err.message : String(err)));
        }
        setVideoUploading(false);
        e.target.value = '';
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveMsg(null);

        const updatedData = {
            ...initialData,
            couple: {
                bride: {
                    firstName: brideFirst.trim(),
                    fatherName: brideFather.trim(),
                    motherName: brideMother.trim(),
                    notes: brideNotes.trim()
                },
                groom: {
                    firstName: groomFirst.trim(),
                    fatherName: groomFather.trim(),
                    motherName: groomMother.trim(),
                    notes: groomNotes.trim()
                },
                parents: `D/o ${brideMother || 'Mrs.'} & ${brideFather || 'Mr.'} | S/o ${groomMother || 'Mrs.'} & ${groomFather || 'Mr.'}`
            },
            events: eventsList,
            gallery: { images: photos },
            media: { videoUrl }
        };

        try {
            const { error } = await supabase.from('invitations').update({
                data: updatedData,
                updated_at: new Date().toISOString()
            }).eq('id', invitationId);

            if (error) throw error;
            setSaveMsg({ type: "success", text: "Invitation data updated successfully!" });
            if (onSave) onSave();
        } catch (err: unknown) {
            console.error("Save error:", err);
            setSaveMsg({ type: "error", text: "Failed to save: " + (err instanceof Error ? err.message : String(err)) });
        }
        setSaving(false);
    };

    return (
        <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-4xl mx-auto w-full">

            {saveMsg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-medium text-sm border ` + (saveMsg.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200")}>
                    {saveMsg.type === "success" ? <CheckCircle className="w-5 h-5" /> : null}
                    {saveMsg.text}
                </div>
            )}

            {/* Couple Names */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">Couple &amp; Family</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2"><span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">B</span><h4 className="font-bold text-slate-800">Bride&apos;s Side</h4></div>
                        <input required placeholder="Bride's First Name" value={brideFirst} onChange={e => setBrideFirst(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all" />
                        <input placeholder="Father's Name" value={brideFather} onChange={e => setBrideFather(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all" />
                        <input placeholder="Mother's Name" value={brideMother} onChange={e => setBrideMother(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all" />
                        <label className="text-sm font-bold text-slate-600 mt-2">Bride&apos;s Personal Notes</label>
                        <textarea placeholder="Write a small note to your guests..." value={brideNotes} onChange={e => setBrideNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all resize-none"></textarea>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">G</span><h4 className="font-bold text-slate-800">Groom&apos;s Side</h4></div>
                        <input required placeholder="Groom's First Name" value={groomFirst} onChange={e => setGroomFirst(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all" />
                        <input placeholder="Father's Name" value={groomFather} onChange={e => setGroomFather(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all" />
                        <input placeholder="Mother's Name" value={groomMother} onChange={e => setGroomMother(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all" />
                        <label className="text-sm font-bold text-slate-600 mt-2">Groom&apos;s Personal Notes</label>
                        <textarea placeholder="Write a small note to your guests..." value={groomNotes} onChange={e => setGroomNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all resize-none"></textarea>
                    </div>
                </div>
            </div>

            {/* Events */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-2xl font-bold text-slate-900">Events Schedule</h3>
                </div>

                <div className="flex flex-col gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {eventsList.map((ev: any, idx: number) => (
                        <div key={ev.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 relative group transition-all hover:border-emerald-200 hover:bg-white">
                            {idx > 0 && (
                                <button type="button" onClick={() => removeEvent(idx)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Event Title</label><input required placeholder="e.g. Sangeet" value={ev.title} onChange={e => handleEventChange(idx, "title", e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Date</label><input required type="date" value={ev.date} onChange={e => handleEventChange(idx, "date", e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs font-bold text-slate-500 uppercase">Start Time</label><input required type="time" value={ev.startTime} onChange={e => handleEventChange(idx, "startTime", e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" /></div>
                                    <div><label className="text-xs font-bold text-slate-500 uppercase">End Time</label><input type="time" value={ev.endTime} onChange={e => handleEventChange(idx, "endTime", e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" /></div>
                                </div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Venue Name</label><input required placeholder="e.g. Grand Taj Hotel" value={ev.venueName} onChange={e => handleEventChange(idx, "venueName", e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" /></div>
                                <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Google Maps URL</label><input placeholder="https://maps.google.com/..." value={ev.googleMapsUrl} onChange={e => handleEventChange(idx, "googleMapsUrl", e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" /></div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addEvent} className="w-full py-4 border-2 border-dashed border-slate-200 text-emerald-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                        <Plus className="w-5 h-5" /> Add Another Event
                    </button>
                </div>
            </div>

            {/* Media */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">Gallery &amp; Video</h3>

                <div className="space-y-8">
                    {/* Photos */}
                    <div>
                        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div><div><h4 className="font-bold text-slate-800">Pre-Wedding Photos</h4><p className="text-xs text-slate-500">Upload up to 3 high-quality portrait photos</p></div></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {photos.map((url, i) => (
                                <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 relative group border border-slate-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="Upload" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-400"><Trash2 className="w-8 h-8" /></button>
                                </div>
                            ))}
                            {photos.length < 3 && (
                                <label className={`aspect-[4/5] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                                    {uploading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : <><Plus className="w-6 h-6 text-slate-400 mb-2" /><span className="text-xs font-bold text-slate-500">Add Photo</span></>}
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Video */}
                    <div>
                        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Video className="w-5 h-5" /></div><div><h4 className="font-bold text-slate-800">Invitation Video (Optional)</h4><p className="text-xs text-slate-500">Max 30MB</p></div></div>
                        {videoUrl ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black max-w-sm group">
                                <video src={videoUrl} controls className="w-full" />
                                <button type="button" onClick={() => setVideoUrl("")} className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <label className={`block w-full max-w-sm py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors ${videoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={videoUploading} />
                                {videoUploading ? <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /><span className="text-sm font-bold text-slate-500">Uploading Video...</span></div> : <div className="flex flex-col items-center gap-2"><div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500"><Plus className="w-6 h-6" /></div><span className="text-sm font-bold text-slate-700">Click to upload video</span></div>}
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 sticky bottom-4 z-10 bg-white/80 backdrop-blur pb-4 pt-2">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-6 py-3 border border-slate-300 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                        Cancel
                    </button>
                )}
                <button type="submit" disabled={saving || uploading || videoUploading} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Saving Changes..." : "Save Invitation Data"}
                </button>
            </div>
        </form>
    );
}
