'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createAuthClient} from 'better-auth/react';
import {twoFactorClient} from 'better-auth/client/plugins';
import {editorialCopy} from '@/i18n/editorial';
import s from './Editorial.module.css';
export const authClient=createAuthClient({plugins:[twoFactorClient()]});
export default function EditorialAuth({locale,mode,enrolled=false,demoPasswordOnly=false}){
  const router=useRouter(),t=editorialCopy(locale),[error,setError]=useState(''),[busy,setBusy]=useState(false),[setup,setSetup]=useState(null),[recovery,setRecovery]=useState(false),[recovered,setRecovered]=useState(false);
  async function act(event,action){event.preventDefault();setError('');setBusy(true);const f=Object.fromEntries(new FormData(event.currentTarget));try{
    let result;
    if(action==='signIn'){result=await authClient.signIn.email({email:f.email,password:f.password});if(!result.error){router.push(`/${locale}/editor/mfa`);router.refresh();}}
    else if(action==='enroll'){result=await authClient.twoFactor.enable({password:f.password,method:'totp'});if(!result.error)setSetup(result.data);}
    else if(recovery){result=await authClient.twoFactor.verifyBackupCode({code:f.code,trustDevice:false});if(!result.error){setRecovered(true);setRecovery(false);}}
    else {result=await authClient.twoFactor.verifyTotp({code:f.code,trustDevice:false});if(!result.error){router.push(`/${locale}/editor`);router.refresh();}}
    if(result?.error)setError(t.authError);
  }catch{setError(t.serverError);}finally{setBusy(false);}}
  return <section className={`${s.studio} ${s.auth}`}><h1>{mode==='sign-in'?t.signIn:t.mfa}</h1><p className={s.notice}>{t.demo}</p>{demoPasswordOnly&&<p className={s.notice} role="status">{t.passwordDemo}</p>}{mode==='sign-in'?<form className={s.form} onSubmit={e=>act(e,'signIn')}><p>{t.operatorOnly}</p><label className={s.field}>{t.email}<input name="email" type="email" autoComplete="username" required/></label><label className={s.field}>{t.password}<input name="password" type="password" autoComplete="current-password" required/></label><button className={s.button} disabled={busy}>{t.signIn}</button></form>:<>
    {!enrolled&&!setup&&!recovered&&<form className={s.form} onSubmit={e=>act(e,'enroll')}><h2>{t.enroll}</h2><label className={s.field}>{t.password}<input name="password" type="password" autoComplete="current-password" required/></label><button className={s.button} disabled={busy}>{t.enroll}</button></form>}
    {setup&&<section className={s.notice}><p>{t.secretHelp}</p><label className={s.field}>{t.setupKey}<input readOnly type="password" value={new URL(setup.totpURI).searchParams.get('secret')} autoComplete="off"/></label><details><summary>{t.setupKey}</summary><p className={s.secret} dir="ltr">{new URL(setup.totpURI).searchParams.get('secret')}</p></details><details><summary>{t.backupCodes}</summary><p className={s.secret} dir="ltr">{setup.backupCodes.join('\n')}</p></details></section>}
    <form className={s.form} onSubmit={e=>act(e,'verify')}><label className={s.field}>{recovery?t.backupCodes:t.code}<input name="code" type="password" inputMode={recovery?'text':'numeric'} autoComplete="one-time-code" required maxLength={32}/></label><button className={s.button} disabled={busy}>{t.verify}</button></form>
    <button className={s.secondary} onClick={()=>setRecovery(!recovery)}>{t.recovery}</button>{(recovery||recovered)&&<p>{t.recoveryHelp}</p>}
  </>}{busy&&<p role="status">{t.saving}</p>}{error&&<p className={s.error} role="alert">{error}</p>}</section>;
}
