'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {editorialCopy} from '@/i18n/editorial';
import {adminCopy} from '@/i18n/admin';
import {languageNames,locales} from '@/i18n/copy';
import {Claim} from './Journey';
import EditorialForm from './EditorialForm';
import TranslationEditor from './TranslationEditor';
import RevisionComparison from './RevisionComparison';
import {Pill} from './AdminWorkspace';
import s from './Admin.module.css';
export default function EditorialStudio({locale,mode,record,catalog,context,language}){
 const t=editorialCopy(locale),a=adminCopy(locale),router=useRouter(),base=`/${locale}/editor`,[error,setError]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[reason,setReason]=useState('');
 const permissions=record?.permissions||context.grants,can=(role,l)=>permissions.some(g=>g.role===role&&(!l||g.locale===l));
 async function mutate(payload,endpoint='/api/editorial'){setBusy(true);setError('');setStatus('');try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const value=await r.json();if(!r.ok){setError(a[value.error]||t[value.error]||t.serverError);return false;}setStatus(t.saved);router.refresh();return value;}catch{setError(t.serverError);return false;}finally{setBusy(false);}}
 const transition=(action,l)=>mutate({action,id:record.entity.id,revision:record.revision,cycle:record.cycle,locale:l,reason});
 const branch=record?`${base}/branches/${record.entity.id}`:null;
 const save=async(document)=>{const result=await mutate({action:'save',id:record?.entity.id,expected:record?.revision,document});if(result){router.push(`${base}/branches/${result.id}/${mode==='new'?'details':mode}`);return true;}return false;};
 return <><nav className={s.breadcrumbs} aria-label={a.administration}><Link href={base}>{a.administration}</Link><span>/</span><Link href={base+'/places'}>{a.places}</Link><span>/</span><span>{mode==='new'?a.newBranch:record.document.translations[locale]?.title||a.untitled}</span></nav><div className={s.title}><div><h1>{mode==='new'?a.newBranch:record.document.translations[locale]?.title||a.untitled}</h1>{record&&<Pill value={record.state} t={a}/>}</div>{record?.published&&<a className={s.secondary} href={`/${locale}/places/${record.entity.id}`}>{t.publicPage}</a>}</div>
 {record&&<nav className={s.tabs}>{['details','evidence','translations','review','preview','history'].map(view=><Link key={view} href={`${branch}/${view}`} aria-current={mode===view?'page':undefined}>{view==='review'?a.reviews:a[view]}</Link>)}</nav>}
 {busy&&<p role="status">{t.saving}</p>}{status&&<p className={s.success} role="status">{status}</p>}{error&&<p className={s.error} role="alert">{error} <button className={s.secondary} onClick={()=>window.location.reload()}>{a.retry}</button></p>}
 {['details','evidence','new'].includes(mode)&&<EditorialForm key={record?.revision||'new'} locale={locale} record={record} section={mode} catalog={catalog} canEdit={can('editor')} busy={busy} onSave={save}/>}
 {mode==='translations'&&<TranslationEditor key={record.revision} locale={locale} record={record} language={language} permissions={permissions} busy={busy} onSave={async(document,l)=>!!await mutate({action:'translation',id:record.entity.id,expected:record.revision,document,locale:l},'/api/administration')}/>}
 {mode==='review'&&<><section className={s.panel}><h2>{a.blockers}</h2><ul className={s.checklist}>{!record.managed&&<li><Link href={branch+'/details'}>{t.save}</Link></li>}{record.evidenceIssue&&<li><Link href={branch+'/evidence'}>{a.evidence}</Link>: {t[record.evidenceIssue]||a.required}</li>}{!['review','published'].includes(record.state)&&<li>{a.submitFirst}</li>}<li>{a.subject}: {record.subject?a.approved:a.subjectNeeded}</li>{locales.map(l=><li key={l}><Link href={branch+'/translations?language='+l}>{languageNames[l]}</Link> · {a[record.states[l]]}</li>)}</ul>{record.ready&&<p className={s.success}>{a.ready}</p>}<label className={s.field}>{t.reason}<textarea value={reason} maxLength={1000} onChange={e=>setReason(e.target.value)}/></label><div className={s.actions}>
 <button className={s.button} disabled={busy||!can('editor')||!record.managed||!['draft','withdrawn'].includes(record.state)||reason.trim().length<5} onClick={()=>transition('submit')}>{t.submit}</button>
 <button className={s.secondary} disabled={busy||!can('subject_reviewer')||record.state!=='review'||reason.trim().length<5} onClick={()=>transition('subject')}>{t.subject}</button>
 <button className={s.secondary} disabled={busy||!permissions.some(g=>['language_reviewer','subject_reviewer','publisher'].includes(g.role))||record.state!=='review'||reason.trim().length<5} onClick={()=>transition('return')}>{t.return}</button></div>
 <div className={s.form}>{locales.map(l=><div className={s.row} key={l}><span>{languageNames[l]} · {a[record.states[l]]}</span><button className={s.secondary} disabled={busy||!can('language_reviewer',l)||!record.subject||record.state!=='review'||record.states[l]==='missing'||reason.trim().length<5} onClick={()=>transition('language',l)}>{t.language} · {languageNames[l]}</button></div>)}</div>
 <div className={s.actions}><Link className={s.secondary} href={branch+'/preview'}>{a.preview}</Link><button className={s.button} disabled={busy||!can('publisher')||!record.ready||reason.trim().length<5} onClick={()=>transition('publish')}>{t.publish}</button><button className={s.secondary} disabled={busy||!can('publisher')||!record.published||reason.trim().length<5} onClick={()=>transition('withdraw')}>{t.withdraw}</button></div></section>
 <details className={s.panel}><summary>{t.comparison}</summary><RevisionComparison previous={record.previous} current={record.document} locale={locale}/></details></>}
 {mode==='preview'&&<section className={s.panel}><h2>{a.preview}</h2><p>{record.document.translations[locale]?.summary||a.missing}</p>{record.document.claims.map(c=><Claim key={c.key} locale={locale} full claim={{id:c.key,copy:c.copy[locale],dimensions:c.dimensions,scope:c.subject===record.entity.chain_id?'chain':'branch',observations:c.observations.map((o,i)=>({...o,id:String(i),source:o.title[locale],statement:o.statement[locale],sourceType:o.type,sourceRevision:o.sourceRevision||'—'}))}}/>)}</section>}
 {mode==='history'&&<><section className={s.panel}><h2>{a.history}</h2>{record.history.map(h=><div className={s.row} key={h.id}><span>{a.history} {h.revision_number}</span><span>{h.actor||t.fictional}</span>{h.created_at&&<span>{new Date(h.created_at).toLocaleString(locale)}</span>}</div>)}</section>{record.events.map(e=><article className={s.panel} key={e.id}><strong>{t[e.action.split(':')[0]]||a[e.action.split(':')[0]]||a.action}</strong><p>{e.reason}</p><p className={s.muted}>{e.actor} · {new Date(e.created_at).toLocaleString(locale)}</p></article>)}</>}
 </>;
}
