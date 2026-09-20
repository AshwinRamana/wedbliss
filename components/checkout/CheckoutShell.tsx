'use client';
import Link from 'next/link';
import BrandMark from '@/components/marketing/BrandMark';
import { usePathname } from 'next/navigation';
const steps = [['templates','Design'],['auth','Account'],['form','Details'],['payment','Payment']];
export default function CheckoutShell({children}:{children:React.ReactNode}) {
  const path = usePathname().split('/').filter(Boolean).pop();
  const index = steps.findIndex(([route]) => route === path);
  return <div className="checkout-studio">
    <header className="studio-header"><Link href="/" className="studio-brand" aria-label="Wedbliss home"><BrandMark/><span>wedbliss.</span></Link><Link href="/#templates">Back to collection ↗</Link></header>
    {index >= 0 && <ol className="studio-steps" aria-label="Checkout progress">{steps.map(([route,label],i)=><li key={route} aria-current={i===index?'step':undefined} data-complete={i<index}><span>{i<index?'✓':`0${i+1}`}</span>{label}</li>)}</ol>}
    <div className="studio-content">{children}</div>
    <footer className="studio-footer"><span>A little link. A beautiful beginning.</span><div><a href="mailto:info@wedbliss.co">Need a hand?</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></footer>
  </div>;
}
