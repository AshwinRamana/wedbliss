import {Suspense} from "react";
import AuthForm from "@/components/auth/AuthForm";
import CheckoutShell from "@/components/checkout/CheckoutShell";
import "../checkout/checkout.css";
export default function Page(){return <CheckoutShell><Suspense fallback={<p role="status">Loading…</p>}><AuthForm /></Suspense></CheckoutShell>}
