'use client';
import {useState} from 'react';
import {editorialCopy} from '@/i18n/editorial';
import s from './Editorial.module.css';
export default function CorrectionForm({locale,entity,revision,claims}){
 const t=editorialCopy(locale),[error,setError]=useState(''),[receipt,setReceipt]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setError('');setBusy(true);const values=Object.fromEntries(new FormData(e.currentTarget));try{const r=await fetch('/api/corrections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,entity,revision})});const data=await r.json();if(r.ok)setReceipt(data.receipt);else setError(t[data.error]||t.serverError);}catch{setError(t.serverError);}finally{setBusy(false);}}
 return <details className={s.card}><summary>{t.report}</summary><p>{t.privacy}</p>{receipt?<p role="status">{t.receipt} <bdi>{receipt}</bdi></p>:<form className={s.form} onSubmit={submit}><label className={s.field}>{t.claims}<select name="claim"><option value="">{t.branches}</option>{claims.map(c=><option key={c.id} value={c.id}>{c.copy.title}</option>)}</select></label><label className={s.field}>{t.message}<textarea name="message" required minLength={10} maxLength={2000}/></label><label className={s.field}>{t.contact}<input name="contact" type="email" maxLength={254}/></label><label className={s.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><button className={s.button} disabled={busy}>{t.send}</button></form>}{error&&<p role="alert" className={s.error}>{error}</p>}</details>;
}
