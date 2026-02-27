"use client";

import { useEffect, useState } from "react";

type AuthUser = {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at?: string;
    user_metadata?: { name?: string; dob?: string };
};

export default function CustomersPage() {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${BACKEND_URL}/api/admin/users`);
                if (res.ok) {
                    const json = await res.json();
                    setUsers(json.users || []);
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
            setLoading(false);
        };
        fetchUsers();
    }, [BACKEND_URL]);

    const handleDeleteUser = async (uid: string, email: string) => {
        if (!window.confirm(`Are you extremely sure you want to completely delete ${email}? This action is permanent.`)) {
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/users/${uid}`, { method: 'DELETE' });
            if (!res.ok) {
                const errorData = await res.json();
                alert(`Failed to delete user: ${errorData.error}`);
                return;
            }
            setUsers(prev => prev.filter(u => u.id !== uid));
        } catch (err) {
            console.error("Delete user error", err);
            alert("Network error trying to delete user.");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
                <p className="text-slate-500 mt-1">Manage signed-up users and their Supabase Auth profiles.</p>
            </div>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                    <h2 className="font-bold text-lg text-slate-800">Registered Customers</h2>
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{users.length} Users</span>
                </div>
                <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-200">Email</th>
                                <th className="p-4 font-bold border-b border-slate-200">Name</th>
                                <th className="p-4 font-bold border-b border-slate-200">Signed Up</th>
                                <th className="p-4 font-bold border-b border-slate-200">Last Login</th>
                                <th className="p-4 font-bold border-b border-slate-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading Auth Users…</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-400">No users found.</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                    <td className="p-4 font-mono text-xs text-slate-700">{u.email}</td>
                                    <td className="p-4 font-bold text-slate-800">{u.user_metadata?.name || "—"}</td>
                                    <td className="p-4 text-xs text-slate-500">
                                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </td>
                                    <td className="p-4 text-xs text-slate-500">
                                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => handleDeleteUser(u.id, u.email)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
