'use client';
import {useState,useEffect} from 'react';
import {adminCopy} from '@/i18n/admin';
import {editorialCopy} from '@/i18n/editorial';
import {copy,languageNames,locales} from '@/i18n/copy';
import {categories,dimensions} from '@/server/repository';
import s from './Editorial.module.css';
const labels={en:['Fictional Rome branch','Illustrative local content. Preparation details are unknown.'],he:['סניף בדיוני ברומא','תוכן מקומי להמחשה. פרטי ההכנה אינם ידועים.'],fr:['Établissement fictif à Rome','Contenu local illustratif. Préparation inconnue.'],ru:['Вымышленный филиал в Риме','Локальный пример. Условия приготовления неизвестны.']};
const blocks=()=>Object.fromEntries(locales.map(l=>[l,{title:labels[l][0],summary:labels[l][1]}]));
const strings=()=>Object.fromEntries(locales.map(l=>[l,labels[l][1]]));
export const newClaim=subject=>({key:crypto.randomUUID(),subject,predicate:'preparation',value:null,dimensions:['unknown'],copy:blocks(),observations:[]});
export const newDocument=()=>({fictional:true,categories:['bakery'],address:null,translations:blocks(),claims:[newClaim('new')]});
function Field({label,value,onChange,type='text',maxLength=2000}){return <label className={s.field}>{label}{type==='textarea'?<textarea value={value||''} onChange={e=>onChange(e.target.value)} maxLength={maxLength}/>:<input type={type} value={value??''} onChange={e=>onChange(e.target.value)} maxLength={maxLength}/>}</label>;}
function Select({label,value,onChange,options}){return <label className={s.field}>{label}<select value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>;}
function TranslationFields({value,onChange,t,block=true,locale}){return <div>{locales.map(l=><details key={l} open={l===locale}><summary>{languageNames[l]}</summary><div className={s.form} lang={l} dir={l==='he'?'rtl':'ltr'}>{block?<><Field label={t.title} value={value[l]?.title} maxLength={160} onChange={v=>onChange(l,{...value[l],title:v})}/><Field label={t.summary} value={value[l]?.summary} type="textarea" onChange={v=>onChange(l,{...value[l],summary:v})}/></>:<Field label={t.statement} value={value[l]} type="textarea" maxLength={1000} onChange={v=>onChange(l,v)}/>}</div></details>)}</div>;}
export default function EditorialForm({locale,record,onSave,busy,section='details',catalog,canEdit=true}){
 const t=editorialCopy(locale),pub=copy(locale),[doc,setDoc]=useState(()=>record?.document||{...newDocument(),destination:catalog?.destinations.find(d=>d.kind==='city'&&d.state!=='archived'&&d.canCreate)?.entity_id||'rome'}),[dirty,setDirty]=useState(false);
 const subject=record?.entity.id||'new',chain=record?.entity.chain_id;
 const change=fn=>{setDoc(old=>{const next=structuredClone(old);fn(next);return next;});setDirty(true);};
 useEffect(()=>{if(!dirty)return;const unload=e=>{e.preventDefault();e.returnValue='';};const click=e=>{const a=e.target.closest('a');if(a&&a.href&&!window.confirm(t.unsaved))e.preventDefault();};window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true);return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true);};},[dirty,t.unsaved]);
 const scopeOptions=[[subject,pub.branch],...(chain?[[chain,pub.chain]]:[])];
 return <form className={s.form} onSubmit={async e=>{e.preventDefault();if(await onSave(doc))setDirty(false);}}><fieldset disabled={!canEdit}>
 {section!=='evidence'&&<section className={s.card}>{!record&&catalog&&<Select label={adminCopy(locale).destination} value={doc.destination} options={catalog.destinations.filter(d=>d.kind==='city'&&d.state!=='archived'&&d.canCreate).map(d=>[d.entity_id,d.labels[locale]])} onChange={v=>change(d=>{d.destination=v;})}/>}<h2>{t.categories}</h2><div className={s.checks}>{(catalog?.categories?.filter(c=>!c.archived||doc.categories.includes(c.id)).map(c=>c.id)||categories).map(c=><label key={c}><input type="checkbox" checked={doc.categories.includes(c)} onChange={e=>change(d=>{d.categories=e.target.checked?[...d.categories,c]:d.categories.filter(x=>x!==c);})}/>{catalog?.categories?.find(k=>k.id===c)?.labels[locale]||pub[c]}</label>)}</div><Field label={t.address} value={doc.address} onChange={v=>change(d=>{d.address=v;})}/><h2>{t.translations}</h2><TranslationFields locale={locale} t={t} value={doc.translations} onChange={(l,v)=>change(d=>{d.translations[l]=v;})}/></section>}
 {(section==='evidence'||!record)&&<>
 <h2>{t.claims}</h2><p className={s.notice}>{t.datesHelp}</p>
 {doc.claims.map((c,i)=><fieldset key={c.key}><legend>{t.claims} {i+1}</legend><div className={s.grid}>
 <Field label={t.predicate} value={c.predicate} maxLength={100} onChange={v=>change(d=>{d.claims[i].predicate=v;})}/><Select label={t.scope} value={c.subject} options={scopeOptions} onChange={v=>change(d=>{d.claims[i].subject=v;})}/>
 <Select label={t.value} value={c.value===null?'unknown':String(c.value)} options={[["unknown",t.unknown],["true",t.yes],["false",t.no]]} onChange={v=>change(d=>{d.claims[i].value=v==='unknown'?null:v==='true';})}/></div>
 <h3>{t.dimensions}</h3><div className={s.checks}>{dimensions.map(dim=><label key={dim}><input type="checkbox" checked={c.dimensions.includes(dim)} onChange={e=>change(d=>{d.claims[i].dimensions=e.target.checked?[...c.dimensions,dim]:c.dimensions.filter(x=>x!==dim);})}/>{pub[dim]}</label>)}</div>
 <TranslationFields locale={locale} t={t} value={c.copy} onChange={(l,v)=>change(d=>{d.claims[i].copy[l]=v;})}/>
 <h3>{t.observations}</h3>{c.observations.map((o,j)=><section className={s.card} key={j}><div className={s.grid}>
 <Select label={t.scope} value={o.subject} options={scopeOptions} onChange={v=>change(d=>{d.claims[i].observations[j].subject=v;})}/>
 <Select label={t.type} value={o.type} options={['venue','chain','historical_record','traveler'].map(k=>[k,t[k]||pub[k]||k])} onChange={v=>change(d=>{d.claims[i].observations[j].type=v;})}/>
 <Select label={t.stance} value={o.stance} options={['supports','contradicts','unresolved'].map(k=>[k,pub[k]])} onChange={v=>change(d=>{d.claims[i].observations[j].stance=v;})}/>
 <Field label={t.url} value={o.url} maxLength={500} onChange={v=>change(d=>{d.claims[i].observations[j].url=v;})}/>
 {['publishedOn','observedOn','effectiveOn','expiresOn'].map(k=><Field key={k} label={t[k]} type="date" value={o[k]} onChange={v=>change(d=>{d.claims[i].observations[j][k]=v;})}/>)}</div>
 <h4>{pub.source}</h4><TranslationFields locale={locale} t={t} block={false} value={o.title} onChange={(l,v)=>change(d=>{d.claims[i].observations[j].title[l]=v;})}/>
 <h4>{t.statement}</h4><TranslationFields locale={locale} t={t} block={false} value={o.statement} onChange={(l,v)=>change(d=>{d.claims[i].observations[j].statement[l]=v;})}/>
 <button className={s.secondary} type="button" onClick={()=>change(d=>{d.claims[i].observations.splice(j,1);})}>{t.remove}</button></section>)}
 <div className={s.actions}><button type="button" className={s.secondary} onClick={()=>change(d=>{d.claims[i].observations.push({sourceKey:crypto.randomUUID(),subject:c.subject,type:c.subject===chain?'chain':'venue',stance:'unresolved',title:strings(),statement:strings(),url:null,publishedOn:null,observedOn:null,effectiveOn:null,expiresOn:null});})}>{t.addObservation}</button><button type="button" className={s.secondary} onClick={()=>change(d=>{d.claims.splice(i,1);})}>{t.remove}</button></div>
 </fieldset>)}<button className={s.secondary} type="button" onClick={()=>change(d=>{d.claims.push(newClaim(subject));})}>{t.addClaim}</button></>}<button className={s.button} disabled={busy||!canEdit}>{t.save}</button></fieldset></form>;
}
