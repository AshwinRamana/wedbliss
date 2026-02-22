import Nav from "@/components/marketing/Nav";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import Templates from "@/components/marketing/Templates";
import Pricing from "@/components/marketing/Pricing";
import Testimonials from "@/components/marketing/Testimonials";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";

export default function Home() {
    return (
        <>
            <Nav />
            <Hero />
            <Features />
            <HowItWorks />
            <Templates />
            <Pricing />
            <Testimonials />
            <CTA />
            <Footer />
        </>
    );
}
