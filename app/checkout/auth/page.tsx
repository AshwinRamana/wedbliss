import {Suspense} from "react";
import AuthForm from "@/components/auth/AuthForm";
export default function Page(){return <Suspense fallback={<p role="status">Loading…</p>}><AuthForm/></Suspense>}
