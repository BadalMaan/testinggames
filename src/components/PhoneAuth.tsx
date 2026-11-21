import {useState} from 'react'
import {loginWithPhone,registerWithPhone,sendRecoveryOtp,verifySmsOtp,updatePasscode} from '../lib/auth'
import {supabase} from '../supabase'
type Props={onClose:()=>void;onSuccess:()=>void}
type Mode='login'|'register'|'forgot'
export default function PhoneAuth({onClose,onSuccess}:Props){
 const [mode,setMode]=useState<Mode>('login'),[step,setStep]=useState<'details'|'verify'|'newpass'>('details')
 const [displayName,setDisplayName]=useState(''),[phone,setPhone]=useState(''),[passcode,setPasscode]=useState(''),[confirm,setConfirm]=useState(''),[otp,setOtp]=useState('')
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('')
 function switchMode(m:Mode){setMode(m);setStep('details');setError('');setMessage('');setPasscode('');setOtp('')}
 async function run(fn:()=>Promise<any>){setBusy(true);setError('');setMessage('');const r=await fn();setBusy(false);if(!r.ok){setError(r.message);return false}setMessage(r.message);return true}
 async function submitDetails(){
  if(mode==='login'){if(await run(()=>loginWithPhone(phone,passcode)))onSuccess();return}
  if(mode==='register'){if(await run(()=>registerWithPhone(phone,passcode,displayName)))setStep('verify');return}
  if(await run(()=>sendRecoveryOtp(phone)))setStep('verify')
 }
 async function verify(){
  if(!await run(()=>verifySmsOtp(phone,otp)))return
  if(mode==='register'){const user=(await supabase?.auth.getUser())?.data.user;if(user&&displayName.trim()){await supabase?.from('students').update({display_name:displayName.trim()}).eq('id',user.id)}onSuccess()}
  else setStep('newpass')
 }
 async function saveNewPass(){if(passcode!==confirm){setError('Passcodes do not match.');return}if(await run(()=>updatePasscode(passcode)))onSuccess()}
 return <div className="modal-backdrop" onClick={onClose}><div className="modal auth-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><div className="brand-mark"><span>G</span></div><div className="eyebrow">GLOBAL PUNJABI CLASSES</div><h2>{step==='verify'?'Verify your mobile':step==='newpass'?'Create a new passcode':mode==='login'?'Welcome back':'Join the Game Arena'}</h2><p className="muted">{step==='verify'?'Enter the one-time code sent to your registered mobile number.':step==='newpass'?'Choose a new passcode for your account.':mode==='login'?'Sign in with your registered mobile number and passcode.':mode==='register'?'Create your student account with just a name, mobile number and passcode.':'Recover your account using SMS verification.'}</p>
 {step==='details'&&<>{mode==='register'&&<label>Student name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Full name"/></label>}<label>Mobile number with country code<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 416 555 1234"/></label>{mode!=='forgot'&&<label>Passcode<input type="password" value={passcode} onChange={e=>setPasscode(e.target.value)} placeholder="At least 6 characters"/></label>}</>}
 {step==='verify'&&<label>SMS verification code<input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter verification code" inputMode="numeric"/></label>}
 {step==='newpass'&&<><label>New passcode<input type="password" value={passcode} onChange={e=>setPasscode(e.target.value)} placeholder="At least 6 characters"/></label><label>Confirm new passcode<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter passcode"/></label></>}
 {error&&<div className="feedback bad">{error}</div>}{message&&<div className="feedback good">{message}</div>}
 <button className="primary-btn wide" disabled={busy} onClick={step==='details'?submitDetails:step==='verify'?verify:saveNewPass}>{busy?'Please wait…':step==='details'?(mode==='login'?'Sign in':mode==='register'?'Create account':'Send recovery code'):step==='verify'?'Verify code':'Update passcode'}</button>
 {step==='details'&&<div className="auth-links">{mode==='login'?<><button onClick={()=>switchMode('register')}>Create student account</button><button onClick={()=>switchMode('forgot')}>Forgot passcode?</button></>:<button onClick={()=>switchMode('login')}>Back to sign in</button>}</div>}
 <p className="muted auth-note">SMS delivery requires Phone Auth and an SMS provider configured in Supabase. Passcodes are handled by Supabase Auth, not stored in this application database.</p>
 </div></div>
}
