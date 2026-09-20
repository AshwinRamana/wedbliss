'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTemplates, DbTemplate } from '@/lib/db';

function Selection() {
  const params = useSearchParams();
  const plan = params.get('plan') === 'premium' ? 'premium' : 'basic';
  const [templates,setTemplates] = useState<DbTemplate[]>([]);
  const [signedIn,setSignedIn] = useState(false);
  const [loading,setLoading] = useState(true);
  const [failed,setFailed] = useState(false);
  useEffect(()=>{
    let active = true;
    supabase.auth.getSession().then(({data})=>{if(active)setSignedIn(Boolean(data.session));}).catch(()=>{});
    getTemplates().then(rows=>{if(active)setTemplates(rows.filter(t=>t.is_live && t.demo_url && !t.id.startsWith('tm-demo-')));}).catch(()=>{if(active)setFailed(true);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  const visible = templates.filter(t=>plan==='premium'||t.tier==='basic');
  return <main className="w-full max-w-6xl mx-auto px-4">
    <div className="studio-intro"><span className="studio-eyebrow">Your invitation starts here</span><h1>Find the one that feels like you.</h1><p>Open a preview, explore the details, then make it yours.</p><div className="studio-plan-switch" aria-label="Choose a plan"><Link href="?plan=basic" aria-current={plan==='basic'}>Basic · ₹999</Link><Link href="?plan=premium" aria-current={plan==='premium'}>Premium · ₹1,999</Link></div><p>{plan==='premium'?'All live designs included.':'Classic designs for your celebration.'}</p></div>
    {loading?<p className="studio-empty" role="status">Loading your collection…</p>:failed?<div className="studio-empty" role="alert">We couldn’t load the collection. <button onClick={()=>window.location.reload()}>Try again</button></div>:visible.length===0?<div className="studio-empty"><h2>No designs available for this plan yet.</h2><p><Link href="?plan=premium">Explore Premium designs</Link> or <a href="mailto:info@wedbliss.co">ask us for help</a>.</p></div>:<div className="studio-designs">{visible.map(t=><article className="studio-design" key={t.id}><a className="studio-art" href={t.demo_url!} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${t.name} in a new tab`}>{t.thumbnail_url ? <img src={t.thumbnail_url} alt={`${t.name} invitation preview`} loading="lazy"/>:<span>{t.name}</span>}</a><div className="studio-design-info"><h2>{t.name}</h2><p>{t.description}</p><div className="studio-design-actions"><a href={t.demo_url!} target="_blank" rel="noopener noreferrer">Preview ↗</a><Link className="studio-select" href={`/checkout/${signedIn?'form':'auth'}?plan=${plan}&template=${encodeURIComponent(t.id)}`}>Choose {t.name}</Link></div></div></article>)}</div>}
  </main>;
}
export default function Page(){return <Suspense fallback={<p className="studio-empty" role="status">Loading collection…</p>}><Selection/></Suspense>;}
