"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Menu, X, Volume2, CalendarDays, MapPin, Heart, Smartphone } from "lucide-react";
import { DbTemplate, FALLBACK_TEMPLATES, getTemplates } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import BrandMark from "./BrandMark";

const moods: Record<string, string> = { Blossom: "Soft, floral & romantic", Noir: "An evening in gold", Gravity: "Written in the stars", Thiruvizha: "Rooted in celebration" };
const filters = ["All designs", "Romantic", "Modern", "Traditional"];
const categories: Record<string, string> = { Blossom: "Romantic", Noir: "Modern", Gravity: "Modern", Thiruvizha: "Traditional" };
function thumbnail(t: DbTemplate) {
  return ["Blossom", "Noir", "Gravity", "Thiruvizha"].includes(t.name) ? `/templates/thumbs/${t.name.toLowerCase()}.webp` : t.thumbnail_url || "";
}
function previewUrl(t: DbTemplate) {
  return t.name === "Thiruvizha" ? "/templates/thiruvizha.html" : t.demo_url || "";
}
const faqs = [
  ["How does my wedding invitation work?", "Choose a design, add your names, photos and event details, then complete payment. Your invitation is published as a website you can share with guests using a single link."],
  ["Can I see a design before choosing it?", "Yes. Open any live preview in the collection to explore the full invitation before you choose your design."],
  ["How do I share it with my guests?", "Send your invitation link on WhatsApp, by text or by email. Guests can open it in their browser without installing an app."],
  ["Can I update the details later?", "Yes. Sign in to your dashboard to edit your invitation when your plans change."],
  ["Is this a subscription?", "No. Basic is ₹999 for 6 months and Premium is ₹1,999 for 12 months. You pay once for your chosen plan."],
];

export default function EditorialHome() {
  const [templates, setTemplates] = useState<DbTemplate[]>(FALLBACK_TEMPLATES);
  const [filter, setFilter] = useState("All designs");
  const [signedIn, setSignedIn] = useState(false);
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(false);
  const [step, setStep] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    getTemplates().then((items) => { if (active) setTemplates(items.filter(t => t.is_live && t.demo_url && t.thumbnail_url)); });
    supabase.auth.getSession().then(({ data }) => { if (active) setSignedIn(!!data.session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotion(!reduced.matches);
    const update = () => setMotion(!reduced.matches);
    reduced.addEventListener("change", update);
    return () => { active = false; subscription.unsubscribe(); reduced.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    if (!motion) return;
    const el = root.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      el?.style.setProperty("--scroll", String(Math.min(window.scrollY / 650, 1)));
      el?.style.setProperty("--progress", `${window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight) * 100}%`);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.1 });
    el?.querySelectorAll(".wb-reveal").forEach(item => observer.observe(item));
    return () => { window.removeEventListener("scroll", scroll); cancelAnimationFrame(frame); observer.disconnect(); };
  }, [motion, filter, templates]);

  useEffect(() => {
    if (!menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuPanel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenu(false); menuButton.current?.focus(); }
      if (event.key === "Tab") {
        const items = [menuButton.current, ...Array.from(menuPanel.current?.querySelectorAll<HTMLAnchorElement>("a") || [])].filter(Boolean) as HTMLElement[];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", key); };
  }, [menu]);

  const selection = (t: DbTemplate) => `/checkout/${signedIn ? "form" : "auth"}?plan=${t.tier}&template=${encodeURIComponent(t.id)}`;
  const visible = templates.filter(t => filter === "All designs" || categories[t.name] === filter);
  const ordered = [...visible].sort((a, b) => ["Blossom", "Noir", "Thiruvizha", "Gravity"].indexOf(a.name) - ["Blossom", "Noir", "Thiruvizha", "Gravity"].indexOf(b.name));

  return (
    <div className={`wb ${motion ? "wb-motion" : "wb-still"}`} ref={root}>
      <a className="wb-skip" href="#main">Skip to content</a>
      <div className="wb-progress" aria-hidden="true" />
      <header className="wb-header">
        <Link href="/" className="wb-brand" aria-label="Wedbliss home"><BrandMark /><span>wedbliss<span className="wb-brand-dot">.</span></span></Link>
        <nav className="wb-desktop-nav" aria-label="Main navigation"><a href="#templates">The collection</a><a href="#how">How it works</a><a href="#pricing">Pricing</a></nav>
        <div className="wb-header-actions"><Link className="wb-login" href={signedIn ? "/dashboard" : "/login"}>{signedIn ? "Dashboard" : "Log in"}</Link><a className="wb-button wb-small" href="#templates">Find your invitation <ArrowUpRight size={15} /></a><button className="wb-menu-button" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="wb-mobile-menu" ref={menuButton} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></div>
      </header>
      {menu && <div className="wb-mobile-menu" id="wb-mobile-menu" ref={menuPanel}><nav aria-label="Mobile navigation">{[["#templates", "The collection"], ["#how", "How it works"], ["#pricing", "Pricing"], ["#questions", "Questions"], [signedIn ? "/dashboard" : "/login", signedIn ? "Dashboard" : "Log in"]].map(([url, label]) => <a href={url} key={url} onClick={() => setMenu(false)}>{label}<ArrowUpRight /></a>)}</nav></div>}

      <main id="main">
        <section className="wb-hero" aria-labelledby="hero-title">
          <div className="wb-hero-copy"><p className="wb-eyebrow"><span className="wb-tiny-star">✳</span> A little link. A beautiful beginning.</p><h1 id="hero-title">Your forever.<br />Their first<br /><em>little glimpse.</em></h1><p className="wb-hero-description">Wedding invitations that move, delight, and feel like you. Made to open hearts. And a hundred WhatsApp chats.</p><div className="wb-hero-actions"><a className="wb-button" href="#templates">Find your invitation <ArrowUpRight size={18} /></a><a href="/templates/thiruvizha.html" target="_blank" rel="noopener noreferrer" className="wb-text-link">Experience a live invite <ArrowUpRight size={16} /></a></div><div className="wb-hero-note"><span>Made for your phone.</span><span>Shared with your people.</span></div></div>
          <div className="wb-hero-art" aria-label="A glimpse of the Noir, Blossom and Thiruvizha invitation collection">
            <span className="wb-orbit wb-orbit-one" aria-hidden="true" /><span className="wb-orbit wb-orbit-two" aria-hidden="true" />
            <a className="wb-invite wb-invite-back" href="https://noir.wedbliss.co" target="_blank" rel="noopener noreferrer" aria-label="Preview Noir invitation"><Image src="/templates/thumbs/noir.webp" alt="Noir wedding invitation in black and gold" width="720" height="1260" /></a>
            <a className="wb-invite wb-invite-side" href="/templates/thiruvizha.html" target="_blank" rel="noopener noreferrer" aria-label="Preview Thiruvizha invitation"><Image src="/templates/thumbs/thiruvizha.webp" alt="Thiruvizha invitation with a traditional brass lamp" width="720" height="1260" /></a>
            <a className="wb-invite wb-invite-front" href="https://blossom.wedbliss.co" target="_blank" rel="noopener noreferrer" aria-label="Preview Blossom invitation"><Image src="/templates/thumbs/blossom.webp" alt="Blossom wedding invitation with pink flowers" priority width="720" height="1260" /><span className="wb-invite-open">Open a little magic <ArrowUpRight size={14} /></span></a>
            <span className="wb-art-note">Something worth opening.</span><span className="wb-round-seal" aria-hidden="true">A NEW WAY<br /><Heart size={24} strokeWidth={1} />TO SAY COME</span>
          </div>
          <div className="wb-hero-bottom"><span>Thoughtfully digital. Beautifully personal.</span><a href="#templates">Scroll to fall in love <span>↓</span></a><button aria-pressed={!motion} onClick={() => setMotion(!motion)}>{motion ? "Pause motion" : "Enable motion"} <span aria-hidden="true">{motion ? "Ⅱ" : "▷"}</span></button></div>
        </section>

        <div className="wb-ribbon" aria-label="Your story, your traditions, your kind of celebration"><div>{[0, 1].map(n => <span key={n} aria-hidden={n === 1}>YOUR STORY <i>✳</i> YOUR TRADITIONS <i>✳</i> YOUR KIND OF CELEBRATION <i>✳</i> </span>)}</div></div>

        <section className="wb-collection wb-section" id="templates">
          <div className="wb-section-heading wb-reveal"><div><p className="wb-eyebrow">01 / THE COLLECTION</p><h2>Find your kind<br />of <em>forever.</em></h2></div><p>A little traditional. A little unexpected. <br />Entirely you. Explore the invitations <br />and see which one feels like home.</p></div>
          <div className="wb-collection-bar"><div className="wb-filters" aria-label="Filter invitation designs">{filters.map(item => <button key={item} className={filter === item ? "selected" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div><span aria-live="polite">{visible.length} {visible.length === 1 ? "design" : "designs"} to fall for</span></div>
          <div className="wb-design-grid">{ordered.map((t, i) => <article key={t.id} className={`wb-design wb-reveal wb-design-${t.name.toLowerCase()}`}>
            <a className="wb-design-image" href={previewUrl(t)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${t.name} live preview`}><span className="wb-design-number">0{i + 1}</span><span className="wb-design-tier">{t.tier}</span><Image src={thumbnail(t)} alt={`${t.name} wedding invitation preview`} width="720" height="1260" loading="lazy" /><span className="wb-preview-pill">Explore live invitation <ArrowUpRight size={16} /></span></a>
            <div className="wb-design-details"><div><h3>{t.name}</h3><p>{moods[t.name] || t.description}</p></div><Link href={selection(t)} className="wb-select-design" aria-label={`Choose ${t.name} invitation`}><ArrowUpRight size={23} /></Link></div>
          </article>)}</div>
          {visible.length === 0 && <div className="wb-empty">More designs are on their way. <button onClick={() => setFilter("All designs")}>Explore the collection →</button></div>}
          <p className="wb-collection-note"><Smartphone size={16} /> Every design is made for mobile. Open a preview and give it a scroll.</p>
        </section>

        <section className="wb-experience" id="experience"><div className="wb-experience-inner"><div className="wb-experience-copy wb-reveal"><p className="wb-eyebrow">MORE THAN AN INVITATION</p><h2>A whole celebration.<br /><em>One beautiful link.</em></h2><p>The joy, the people, the place. Bring it all together in an invitation your guests can keep coming back to.</p><div className="wb-feature-lines"><div><CalendarDays size={20} /><span>Every event, beautifully in order</span></div><div><MapPin size={20} /><span>Less “where is it?” More “see you there.”</span></div><div><Volume2 size={20} /><span>Your photos. Your music. Your mood.</span></div></div><a href="#templates" className="wb-light-link">Make it yours <ArrowUpRight size={18} /></a></div><div className="wb-story-preview wb-reveal"><span className="wb-preview-label">A GLIMPSE INSIDE YOUR INVITATION</span><div className="wb-story-card"><p className="wb-eyebrow">TOGETHER IS A BEAUTIFUL PLACE TO BE</p><h3>The best days<br /><em>are almost here.</em></h3><div className="wb-event"><span>01</span><div><small>THE EVENING BEFORE</small><h4>The reception</h4><p>Friday, 18 December · 6:30 PM</p></div><span>✳</span></div><div className="wb-event"><span>02</span><div><small>THE BIG DAY</small><h4>The wedding</h4><p>Saturday, 19 December · 7:30 AM</p></div><Heart size={17} /></div><div className="wb-story-footer"><span>Two families. One lovely beginning.</span><span>♡</span></div></div><span className="wb-story-caption">Your moments, thoughtfully brought together. <span>↗</span></span></div></div></section>

        <section className="wb-how wb-section" id="how"><div className="wb-section-heading wb-reveal"><div><p className="wb-eyebrow">02 / FROM YES TO YOU’RE INVITED</p><h2>Big feelings.<br /><em>Little effort.</em></h2></div><p>You have a wedding to look forward to. <br />Let’s make this part easy.</p></div><div className="wb-steps">{[{title:"Find your feeling",copy:"Explore the live designs. Pick the one that feels like the two of you.", detail:"Browse → Preview → Choose"},{title:"Make it personal",copy:"Add your names, your photos and all the details that make the day yours.",detail:"Your people. Your places. Your story."},{title:"Let the joy travel",copy:"Complete payment and share your invitation link. Your people are one tap away.",detail:"One link. All your favourite people."}].map((s,i) => <button key={s.title} className={`wb-step ${step === i ? "active" : ""}`} aria-expanded={step === i} onClick={() => setStep(i)}><span className="wb-step-top">0{i+1}<ArrowUpRight size={22}/></span><h3>{s.title}</h3><p>{s.copy}</p><span className="wb-step-detail">{step === i ? s.detail : "Take a closer look →"}</span></button>)}</div></section>

        <section className="wb-pricing wb-section" id="pricing"><div className="wb-section-heading wb-reveal"><div><p className="wb-eyebrow">03 / SMALL PRICE. BIG OCCASION.</p><h2>A beautiful beginning.<br /><em>Without the extras.</em></h2></div><p>One payment. Your own invitation. <br />No monthly subscription.</p></div><div className="wb-plans">{[{name:"Basic",price:"999",text:"All the essentials for your big day.",features:["Classic invitation designs","Wedding & reception details","Photo gallery & shareable link","Your invitation live for 6 months"]},{name:"Premium",price:"1,999",text:"A little more magic. Every detail yours.",features:["Access to premium invitation designs","Multiple events & muhurtham countdown","Photo gallery, music & video","Your invitation live for 12 months"]}].map((plan,i) => <article className={`wb-plan wb-reveal ${i ? "wb-plan-premium" : ""}`} key={plan.name}><div className="wb-plan-heading"><h3>{plan.name}</h3><span>{i ? "THE FULL EXPERIENCE" : "THE ESSENTIALS"}</span></div><p>{plan.text}</p><div className="wb-price"><span>₹</span>{plan.price}<small>/ one time</small></div><ul>{plan.features.map(feature => <li key={feature}><Check size={16}/>{feature}</li>)}</ul><Link className={`wb-button ${i ? "wb-button-cream" : "wb-button-outline"}`} href={`/checkout/templates?plan=${plan.name.toLowerCase()}`}>Explore {plan.name} <ArrowUpRight size={18}/></Link></article>)}</div></section>

        <section className="wb-questions wb-section" id="questions"><div className="wb-question-heading"><p className="wb-eyebrow">A FEW THINGS YOU MIGHT WONDER</p><h2>Glad you <br /><em>asked.</em></h2><p>Need a hand with something else?</p><a className="wb-text-link" href="mailto:info@wedbliss.co">Let’s talk <ArrowUpRight size={16}/></a></div><div className="wb-faqs">{faqs.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
        <section className="wb-final"><p className="wb-eyebrow">THE BEGINNING OF SOMETHING BEAUTIFUL</p><h2>First comes love.<br />Then comes <em>the invite.</em></h2><a className="wb-button wb-button-cream" href="#templates">Find your invitation <ArrowUpRight size={18}/></a><span className="wb-final-flower" aria-hidden="true">✳</span></section>
      </main>
      <footer className="wb-footer" id="contact"><div className="wb-footer-top"><Link href="/" className="wb-brand"><BrandMark/><span>wedbliss.</span></Link><p>Made with love.<br/>Shared with everyone you love.</p><div><a href="mailto:info@wedbliss.co">info@wedbliss.co <ArrowUpRight size={14}/></a><a href="tel:+918122357677">+91 81223 57677</a></div><a href="#main" className="wb-back-top" aria-label="Back to top">↑</a></div><div className="wb-footer-bottom"><span>© {new Date().getFullYear()} Wedbliss</span><span>Rooted in Tamil Nadu. Celebrating everywhere.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refunds">Refunds</Link></div></div></footer>
    </div>
  );
}
