'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {supabase} from '@/lib/supabase';
import './auth.css';
export default function AuthForm({signup=false}:{signup?:boolean}) {
 const router=useRouter(),params=useSearchParams();
 const template=params.get('template');
 const query=template?`?${new URLSearchParams({template,plan:params.get('plan')==='premium'?'premium':'basic'})}`:'';
 const [details,setDetails]=useState({name:'',email:'',phone:'',dob:''});
 const [step,setStep]=useState<'details'|'otp'>('details'),[otp,setOtp]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[cooldown,setCooldown]=useState(0),[notice,setNotice]=useState('');
 const codeRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!cooldown)return;const t=setTimeout(()=>setCooldown(v=>v-1),1000);return()=>clearTimeout(t)},[cooldown]);
 useEffect(()=>{if(step==='otp')codeRef.current?.focus()},[step]);
 const update=(key:keyof typeof details,value:string)=>{setDetails(d=>({...d,[key]:value}));setError('')};
 async function request(endpoint:string,body:object){const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000'}/api/auth/${endpoint}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});const data=await res.json();if(!res.ok)throw new Error(data.error||'Something went wrong. Please try again.');return data;}
 async function send(){
  if(signup){const birth=new Date(`${details.dob}T00:00:00`),cutoff=new Date();cutoff.setFullYear(cutoff.getFullYear()-18);if(!details.dob||!Number.isFinite(birth.getTime())||birth>cutoff){setError('You must be at least 18 to create an account.');return;}}
  setBusy(true);setError('');setNotice('');
  try{await request('send-otp',{email:details.email.trim(),type:signup?'signup':'login'});setOtp('');setStep('otp');setCooldown(30);setNotice('A new code is on its way.');codeRef.current?.focus();}catch(e){setError(e instanceof Error?e.message:'Unable to send the code. Try again.')}finally{setBusy(false)}
 }
 async function verify(){setBusy(true);setError('');try{
  const data=await request('verify-otp',{email:details.email.trim(),otp,...(signup?{name:details.name.trim(),phone:details.phone.trim(),dob:details.dob}:{})});
  if(!data.sessionPassword)throw new Error('We could not sign you in. Please request a new code.');
  let established=false;
  for(let attempt=0;attempt<3;attempt++){const result=await supabase.auth.signInWithPassword({email:details.email.trim(),password:data.sessionPassword});if(!result.error&&result.data.session){established=true;break;}if(attempt<2)await new Promise(r=>setTimeout(r,1000));}
  if(!established)throw new Error('Your code was verified, but sign-in failed. Please log in again.');
  router.push(template?`/checkout/form${query}`:'/');router.refresh();
 }catch(e){setError(e instanceof Error?e.message:'Unable to verify. Please try again.')}finally{setBusy(false)}}
 return <main className="auth-page"><aside className="auth-story" aria-label="Your invitation starts here"><span className="auth-eyebrow">MADE FOR YOUR MOMENT</span><h2>A beautiful<br/>beginning.</h2><div className="auth-invitation" aria-hidden="true"><span>TOGETHER WITH OUR FAMILIES</span><p>Ananya<br/><i>&</i><br/>Arjun</p><span>THE WEDDING CELEBRATION</span><div>24 · 02 · 2027</div></div><p>Your people. Your story.<br/>One invitation to bring them together.</p></aside><section className="auth-panel"><span className="auth-eyebrow">{step==='otp'?'CHECK YOUR INBOX':signup?'YOUR WEDBLISS ACCOUNT':'WELCOME BACK'}</span><h1>{step==='otp'?'Enter your code':signup?'Start something beautiful.':'Your next chapter awaits.'}</h1><p className="auth-intro">{step==='otp'?<>We sent a 4-digit code to <strong>{details.email.trim()}</strong>.</>:signup?'Create an account to make your invitation.':'Log in with your email. No password needed.'}</p>
 <form onSubmit={e=>{e.preventDefault();if(!busy)void(step==='otp'?verify():send())}} aria-busy={busy}>
 {step==='details'?<fieldset disabled={busy}>{signup&&<label htmlFor="auth-name">Full name<input id="auth-name" autoComplete="name" required value={details.name} onChange={e=>update('name',e.target.value)}/></label>}<label htmlFor="auth-email">Email address<input id="auth-email" type="email" autoComplete="email" required value={details.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label>{signup&&<><label htmlFor="auth-phone">Phone number<input id="auth-phone" type="tel" autoComplete="tel" required value={details.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91 98765 43210"/></label><label htmlFor="auth-dob">Date of birth<input id="auth-dob" type="date" autoComplete="bday" required value={details.dob} onChange={e=>update('dob',e.target.value)} aria-describedby="age-note"/></label><small id="age-note">You must be 18 or older.</small></>}</fieldset>:<><label htmlFor="auth-code">Verification code<input ref={codeRef} className="auth-code" id="auth-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} required value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,4))} aria-describedby="code-note" disabled={busy}/></label><small id="code-note">Valid for 10 minutes. Check spam if it hasn’t arrived.</small></>}
 {error&&<p className="auth-error" role="alert">{error}</p>}
 <button className="auth-submit" disabled={busy||(step==='otp'&&otp.length!==4)}>{busy?(step==='otp'?'Verifying…':'Sending code…'):step==='otp'?(signup?'Verify & create account':'Verify & log in'):'Send verification code'}<span aria-hidden="true">↗</span></button>
 {step==='otp'&&<div className="auth-actions"><button type="button" disabled={busy} onClick={()=>{setStep('details');setError('');setNotice('');}}>Edit {signup?'details':'email'}</button><button type="button" disabled={busy||cooldown>0} onClick={()=>void send()}>{cooldown>0?`Resend in ${cooldown}s`:'Resend code'}</button></div>}
 <span className="auth-status" role="status">{notice}</span>
 </form><p className="auth-switch">{signup?'Already have an account?':'New to Wedbliss?'} <Link href={`${signup?'/login':'/signup'}${query}`}>{signup?'Log in':'Create an account'}</Link></p>{signup&&<p className="auth-legal">By continuing, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>}</section></main>;
}
