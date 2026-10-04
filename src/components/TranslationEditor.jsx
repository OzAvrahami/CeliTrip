'use client';
import {useState} from 'react';
import Link from 'next/link';
import {adminCopy} from '@/i18n/admin';
import {languageNames,locales} from '@/i18n/copy';
import {useUnsaved} from './AdminForms';
import s from './Admin.module.css';
export default function TranslationEditor({locale,record,language='en',onSave,busy,permissions}){
 const t=adminCopy(locale),[target,setTarget]=useState(locales.includes(language)?language:locale),[source,setSource]=useState(language==='en'?'he':'en'),[doc,setDoc]=useState(record.document),[dirty,setDirty]=useState(false);useUnsaved(dirty,locale);
 const fields=[{label:t.details+' / '+t.name,path:['translations']},{label:t.details+' / '+t.details,path:['translations'],field:'summary'}];
 doc.claims.forEach((c,i)=>{fields.push({label:t.claim+' '+(i+1)+' / '+t.name,path:['claims',i,'copy']},{label:t.claim+' '+(i+1)+' / '+t.details,path:['claims',i,'copy'],field:'summary'});c.observations.forEach((o,j)=>fields.push({label:t.source+' '+(i+1)+'.'+(j+1),path:['claims',i,'observations',j,'title'],plain:true},{label:t.evidence+' '+(i+1)+'.'+(j+1),path:['claims',i,'observations',j,'statement'],plain:true}));});
 const get=(f,l)=>{let v=doc;for(const key of f.path)v=v[key];return f.plain?v[l]:v[l]?.[f.field||'title'];};
 const change=(f,value)=>{setDoc(old=>{const next=structuredClone(old);let v=next;for(const key of f.path)v=v[key];if(f.plain)v[target]=value;else v[target]={...v[target],[f.field||'title']:value};return next;});setDirty(true);};
 const allowed=permissions.some(g=>g.role==='editor'||g.role==='language_reviewer'&&g.locale===target);
 return <section className={s.panel}><p>{t.translationHelp}</p><div className={s.grid}><label className={s.field}>{t.sourceLanguage}<select value={source} onChange={e=>setSource(e.target.value)}>{locales.map(l=><option key={l} value={l}>{languageNames[l]}</option>)}</select></label><label className={s.field}>{t.targetLanguage}<select value={target} onChange={e=>{if(!dirty||window.confirm(t.translationHelp)){setDoc(record.document);setDirty(false);setTarget(e.target.value);}}}>{locales.map(l=><option key={l} value={l}>{languageNames[l]}</option>)}</select></label></div>
 <form onSubmit={async e=>{e.preventDefault();if(await onSave(doc,target))setDirty(false);}}>{fields.map((f,i)=><div className={s.translationRow} key={i}><strong>{f.label}</strong><div className={s.grid}><div lang={source} dir={source==='he'?'rtl':'ltr'}><label className={s.field}>{languageNames[source]}<textarea readOnly value={get(f,source)||''}/></label></div><div lang={target} dir={target==='he'?'rtl':'ltr'}><label className={s.field}>{languageNames[target]}<textarea disabled={!allowed} value={get(f,target)||''} maxLength={f.plain?1000:f.field?2000:160} onChange={e=>change(f,e.target.value)}/></label></div></div></div>)}<div className={s.actions}><button className={s.button} disabled={busy||!allowed}>{t.save}</button><Link className={s.secondary} href={`/${locale}/editor/branches/${record.entity.id}/review`}>{t.reviewAction}</Link></div></form></section>;
}
