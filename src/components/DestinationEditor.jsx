'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {adminCopy} from '@/i18n/admin';
import {destinationCopy} from '@/i18n/destinations';
import {geographyCopy} from '@/i18n/geography';
import {editorialCopy} from '@/i18n/editorial';
import {locales,languageNames} from '@/i18n/copy';
import {mergeGenerated} from '@/lib/translation-state';
import {destinationContext,destinationList,destinationQuery} from '@/lib/destination-navigation';
import {useUnsaved} from './AdminForms';
import s from './Admin.module.css';
const initial=(r,locale,parent)=>({kind:r?.kind||(parent?'city':'country'),parent:r?.parent_id||parent||'',sourceLocale:r?.source_locale||locale,labels:r?.labels||Object.fromEntries(locales.map(l=>[l,''])),provenance:r?.provenance||{},mode:r?.provenance?.[r?.source_locale]?.namingMode||(r&&!r.identity?'fictional':'geographic'),identity:r?.identity||null,receipt:null,manualLocales:[],internalNote:r?.internal_note||''});
const keyFor=f=>JSON.stringify([f.kind,f.parent,f.sourceLocale,f.labels[f.sourceLocale],f.mode]);
export default function DestinationEditor({locale,record,catalog,q={},context}){
 const t={...destinationCopy(locale),...geographyCopy(locale)},a=adminCopy(locale),e=editorialCopy(locale),router=useRouter();
 const [saved,setSaved]=useState(record),[form,setForm]=useState(()=>initial(record,locale,q.parent)),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(''),[generating,setGenerating]=useState(false),[feedback,setFeedback]=useState({}),[fields,setFields]=useState({}),[lookup,setLookup]=useState({}),[candidates,setCandidates]=useState([]),[preview,setPreview]=useState(false),[overview,setOverview]=useState(q.saved==='1'),[dialogAction,setDialogAction]=useState(''),[reason,setReason]=useState(''),[confirmed,setConfirmed]=useState(false),[refreshFailed,setRefreshFailed]=useState(false);
 const live=useRef(form),sequence=useRef(0),last=useRef(''),inFlight=useRef(false),pending=useRef(false),dialog=useRef(null),names=useRef(null),editor=useRef(null),actionArea=useRef(null),dialogTrigger=useRef(null);
 useUnsaved(dirty,locale);
 const from=destinationContext(q.from||''),back=destinationList(locale,from),suffix=destinationQuery(from),base=`/${locale}/editor/destinations`,editUrl=id=>base+'/'+id+suffix;
 const parent=catalog.destinations.find(d=>d.entity_id===form.parent),parentName=parent?.labels[locale]||parent?.labels.en;
 const readonly=saved?.state==='archived'||(saved&&!saved.permissions.editor&&!saved.permissions.administrator);
 const published=!!(saved?.published_revision||saved?.legacy_publication),currentPublished=saved?.published_revision===saved?.revision_id&&!!saved;
 const state=saved?.state==='archived'?'archived':published?(currentPublished?'published':'publishedDraft'):saved?.review_state||'draft';
 const message=code=>code==='translationNotConfigured'?t.translationDeferred:t[code]||a[code]||e[code]||t.serverError;
 const update=(next,sourceChanged=false)=>{live.current=next;setForm(next);setDirty(true);setFields({});setFeedback({});if(sourceChanged){sequence.current++;last.current='';setCandidates([]);setForm({...next,receipt:null});live.current={...next,receipt:null};}};
 const change=(key,value)=>update({...live.current,[key]:value},['kind','parent','sourceLocale','mode'].includes(key));
 const name=(l,value)=>{const f=live.current;update({...f,labels:{...f.labels,[l]:value},provenance:{...f.provenance,[l]:{method:l===f.sourceLocale?'source':'manual'}},manualLocales:[...new Set([...f.manualLocales,l])]},l===f.sourceLocale);};
 async function api(body){let response;try{response=await fetch('/api/administration',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}catch{throw new Error('networkFailure');}let result;try{result=await response.json();}catch{throw new Error('serverError');}if(!response.ok){const error=new Error(result.error||'serverError');error.fields=result.fields;throw error;}return result;}
 async function generate(identity){const snapshot=live.current,key=keyFor(snapshot);if(snapshot.mode!=='geographic'||!snapshot.labels[snapshot.sourceLocale]?.trim()||inFlight.current)return;
  const n=++sequence.current;inFlight.current=true;setGenerating(true);setLookup({});last.current=key;
  try{const body={action:'destination-generation',id:saved?.entity_id,expected:saved?.revision_id,version:saved?.version,kind:snapshot.kind,parent:snapshot.parent,sourceLocale:snapshot.sourceLocale,source:snapshot.labels[snapshot.sourceLocale],mode:snapshot.mode,identity};let result=await api(body);
   if(n!==sequence.current||keyFor(live.current)!==key){setLookup({text:t.staleTranslation});return;}
   if(result.candidates){
    const exact=result.candidates.filter(c=>c.labels[snapshot.sourceLocale]?.trim().toLocaleLowerCase()===snapshot.labels[snapshot.sourceLocale].trim().toLocaleLowerCase());
    if(result.candidates.length===1&&exact.length===1)result=await api({...body,identity:exact[0].identity.id});
    else{setCandidates(result.candidates);if(!result.candidates.length)setLookup({text:t.noMatches});return;}
   }
   if(n!==sequence.current||keyFor(live.current)!==key){setLookup({text:t.staleTranslation});return;}
   const current=live.current,protectedLocales=locales.filter(l=>l===current.sourceLocale||current.manualLocales.includes(l)||current.provenance[l]?.method?.includes('manual')||saved?.reviews.some(r=>r.locale===l));
   const labels=mergeGenerated(current.labels,result.labels,snapshot.labels,keyFor(current),key,protectedLocales),provenance={...current.provenance};
   for(const l of locales)if(!protectedLocales.includes(l)&&labels[l]&&labels[l]===result.labels[l])provenance[l]={method:result.provider};
   update({...current,labels,provenance,identity:result.identity,receipt:result.receipt});setCandidates([]);setLookup({text:t.preserved});
  }catch(err){setLookup({text:message(err.message),error:true});}finally{inFlight.current=false;setGenerating(false);}
 }

 function focusField(key){if(editor.current)editor.current.open=true;if(names.current&&key.startsWith('labels.'))names.current.open=true;requestAnimationFrame(()=>document.getElementById('destination-'+key.replace('.','-'))?.focus());}
 const inputProps=key=>({id:'destination-'+key.replace('.','-'),'aria-invalid':!!fields[key],'aria-describedby':fields[key]?'error-'+key.replace('.','-'):undefined});
 const inline=key=>fields[key]&&<span id={'error-'+key.replace('.','-')} className={s.fieldError}>{message(fields[key])}</span>;
 function begin(action,event){if(dirty||generating){setFeedback({at:'actions',error:true,text:t.unsaved});return;}dialogTrigger.current=event.currentTarget;setReason('');setConfirmed(false);setFields({});setFeedback({});setDialogAction(action);dialog.current.showModal();}
 function closeDialog(){if(pending.current)return;dialog.current.close();setDialogAction('');setFields({});dialogTrigger.current?.focus();}
 async function persist(operation){if(pending.current)return;const at=operation==='save'?'save':dialogAction?'dialog':'actions';
  if(operation!=='save'&&(dirty||generating)){setFeedback({at,error:true,text:t.unsaved});return;}
  pending.current=true;setBusy(operation);setFeedback({at,text:t.pending});setFields({});let committed=false;
  try{
   const result=operation==='save'?await api({...form,action:'destination',id:saved?.entity_id,expected:saved?.revision_id,version:saved?.version}):await api({action:'destination-transition',operation,id:saved.entity_id,expected:saved.revision_id,version:saved.version,cycle:saved.cycle,reason,confirmGeography:confirmed});
   committed=true;
   const response=await fetch('/api/administration?view=destination&id='+encodeURIComponent(result.id),{cache:'no-store'});if(!response.ok)throw new Error('savedRefreshFailed');const r=await response.json();
   const f=initial(r,locale);setSaved(r);setForm(f);live.current=f;setDirty(false);setPreview(false);last.current='';setRefreshFailed(false);setOverview(operation==='save'&&!saved);
   if(dialog.current.open){dialog.current.close();setDialogAction('');requestAnimationFrame(()=>actionArea.current?.focus());}
   setFeedback({at:operation==='save'?'save':'actions',text:operation==='save'?a.saved:t.actionDone});
   if(!saved)router.replace(editUrl(r.entity_id)+(suffix?'&':'?')+'saved=1');else router.refresh();
  }catch(err){const errors=err.fields||{};setFields(errors);setFeedback({at,error:true,text:message(committed?'savedRefreshFailed':err.message),code:committed?'savedRefreshFailed':err.message});if(committed)setRefreshFailed(true);const first=Object.keys(errors)[0];if(first){if(dialog.current.open&&first.startsWith('labels.')){dialog.current.close();setDialogAction('');setFeedback({at:'actions',error:true,text:t.missingNames});}focusField(first);}}
  finally{pending.current=false;setBusy('');}
 }
 const status=at=>feedback.at===at&&<div role={feedback.error?'alert':'status'} aria-live={feedback.error?'assertive':'polite'} className={feedback.error?s.error:s.success}>{feedback.text}{['conflict','savedRefreshFailed'].includes(feedback.code)&&saved&&<p><a href={editUrl(saved.entity_id)} target="_blank" rel="noreferrer">{t.latest}</a></p>}</div>;
 const cityHref=saved?base+'/new?parent='+encodeURIComponent(saved.entity_id)+(from?'&from='+encodeURIComponent(from):''):'';
 const canAddCity=saved?.kind==='country'&&saved.state!=='archived'&&(context.administrator||catalog.destinations.some(d=>d.entity_id===saved.entity_id&&d.canCreate));
 const childrenHref=destinationList(locale,{kind:'city',destination:saved?.entity_id});
 const editFields=<div className={s.form}>
 {!saved&&<div className={s.grid}><label className={s.field}>{a.kind}<select {...inputProps('kind')} value={form.kind} onChange={ev=>change('kind',ev.target.value)} disabled={!context.administrator}><option value="country">{a.country}</option><option value="city">{a.city}</option></select>{inline('kind')}</label>{form.kind==='city'&&<label className={s.field}>{a.parent}<select {...inputProps('parent')} value={form.parent} onChange={ev=>change('parent',ev.target.value)}><option value="">—</option>{catalog.destinations.filter(d=>d.kind==='country'&&d.state!=='archived'&&(context.administrator||d.canCreate)).map(d=><option key={d.entity_id} value={d.entity_id}>{d.labels[locale]||d.labels.en}</option>)}</select>{inline('parent')}</label>}</div>}
 <div className={s.grid}><label className={s.field}>{t.sourceLanguage}<select {...inputProps('sourceLocale')} value={form.sourceLocale} disabled={readonly||!!busy} onChange={ev=>change('sourceLocale',ev.target.value)}>{locales.map(l=><option key={l} value={l}>{languageNames[l]}</option>)}</select>{inline('sourceLocale')}</label><label className={s.field}>{t.namingMode}<select value={form.mode} disabled={readonly||!!busy} onChange={ev=>change('mode',ev.target.value)}><option value="geographic">{t.geographic}</option><option value="fictional">{t.manualNames}</option></select></label></div>
 <label className={s.field}>{t.sourceName}<input {...inputProps('labels.'+form.sourceLocale)} lang={form.sourceLocale} dir={form.sourceLocale==='he'?'rtl':'ltr'} value={form.labels[form.sourceLocale]} maxLength={160} disabled={readonly||!!busy} onChange={ev=>name(form.sourceLocale,ev.target.value)} onBlur={()=>{if(keyFor(live.current)!==last.current)generate();}} onKeyDown={ev=>{if(ev.key==='Enter'){ev.preventDefault();ev.currentTarget.blur();}}}/>{inline('labels.'+form.sourceLocale)}</label>
 {form.mode==='geographic'&&<><p className={s.muted}>{t.sourceHelp}</p><div className={s.actions}><button type="button" className={s.secondary} disabled={generating||readonly||!!busy} onClick={()=>generate()}>{lookup.error?t.retry:t.find}</button>{generating&&<span role="status">{t.generating}</span>}</div>{lookup.text&&<p role={lookup.error?'alert':'status'} className={lookup.error?s.error:s.muted}>{lookup.text}</p>}</>}
 {!!candidates.length&&<section className={s.panel}><h3>{t.chooseIdentity}</h3>{candidates.map(c=><div className={s.row} key={c.identity.id}><div><strong>{c.labels[form.sourceLocale]||c.labels.en}</strong><small>{c.description}{c.region?' / '+c.region:''}</small></div><button type="button" className={s.secondary} onClick={()=>generate(c.identity.id)} disabled={generating}>{t.choose}</button></div>)}</section>}
 <details ref={names} className={s.destinationDetails} open={!saved||undefined}><summary>{t.names}</summary><div className={s.grid}>{locales.filter(l=>l!==form.sourceLocale).map(l=><label className={s.field} key={l}>{languageNames[l]}<input {...inputProps('labels.'+l)} lang={l} dir={l==='he'?'rtl':'ltr'} maxLength={160} disabled={readonly||!!busy} value={form.labels[l]} onChange={ev=>name(l,ev.target.value)}/>{inline('labels.'+l)}<small>{form.labels[l]?t[form.provenance[l]?.method||'manual']:t.missing}</small></label>)}</div></details>
 <label className={s.field}>{t.note}<textarea {...inputProps('internalNote')} maxLength={1000} disabled={readonly||!!busy} value={form.internalNote} onChange={ev=>change('internalNote',ev.target.value)}/>{inline('internalNote')}<small>{t.noteHelp}</small></label>
 {readonly&&<p className={s.muted}>{t.readOnly}</p>}
 {!readonly&&(!saved||dirty)&&<div><button className={s.button} disabled={!!busy||generating||refreshFailed}>{busy==='save'?t.pending:t.saveDraft}</button>{status('save')}</div>}
 {saved&&!dirty&&status('save')}
 </div>;
 return <>
 <nav className={s.breadcrumbs} aria-label={a.administration}><Link href={`/${locale}/editor`}>{a.administration}</Link><span>/</span><Link href={back}>{a.destinations}</Link>{parent&&<><span>/</span><Link href={editUrl(parent.entity_id)}>{parentName}</Link></>}<span>/</span><span aria-current="page">{saved?saved.labels[locale]||saved.labels[saved.source_locale]:a.newDestination}</span></nav>
 <p><Link className={s.secondary} href={back}>{t.back}</Link></p>
 <div className={s.title}><div><h1>{saved?saved.labels[locale]||saved.labels[saved.source_locale]:a.newDestination}</h1><p>{a[form.kind]}{parent&&<> · <Link href={editUrl(parent.entity_id)}>{parentName}</Link></>}</p></div><span className={s.pill}>{t[state]}</span></div>
 {overview&&saved&&<section className={s.panel}><p role="status" className={s.success}>{t.savedOverview}</p><div className={s.actions}><Link className={s.secondary} href={back}>{t.back}</Link>{canAddCity&&<Link className={s.secondary} href={cityHref}>{t.addCity}</Link>}<button className={s.secondary} onClick={()=>{setOverview(false);if(editor.current)editor.current.open=true;focusField('labels.'+form.sourceLocale);}}>{t.continueEditing}</button></div></section>}
 <form noValidate onSubmit={ev=>{ev.preventDefault();persist('save');}} aria-busy={!!busy}>
 {overview?<details ref={editor} className={s.panel}><summary>{t.continueEditing}</summary>{editFields}</details>:<section className={s.panel}>{editFields}</section>}
 </form>
 {saved&&<section className={s.panel} id="destination-actions" ref={actionArea} tabIndex={-1}><h2>{t.publicationState}</h2><p><span className={s.pill}>{t[state]}</span></p><p className={s.muted}>{t.geographyHelp}</p>
 {dirty?<p role="status">{t.unsaved}</p>:<>
 {!currentPublished&&saved.state!=='archived'&&<>{saved.blockers.includes('missingNames')&&<p><button className={s.secondary} onClick={()=>focusField('labels.'+locales.find(l=>!form.labels[l]?.trim()))}>{t.namesAction}</button></p>}{saved.blockers.includes('parentNotPublished')&&<p>{t.parentNotPublished}: <Link className={s.secondary} href={editUrl(saved.parent_id)}>{parentName}</Link></p>}{!saved.permissions.publisher&&<p>{t.permissionNeeded}</p>}</>}
 <div className={s.actions}>
 {!currentPublished&&saved.state!=='archived'&&saved.permissions.publisher&&!saved.blockers.length&&<button className={s.button} disabled={!!busy||refreshFailed} onClick={ev=>begin('publish',ev)}>{t.publish}</button>}
 {saved.state==='archived'&&saved.permissions.administrator&&<button className={s.button} disabled={!!busy||refreshFailed} onClick={()=>persist('restore')}>{t.restore}</button>}
 <button className={s.secondary} disabled={!!busy} aria-expanded={preview} onClick={()=>setPreview(!preview)}>{t.preview}</button>
 {published&&<Link className={s.secondary} href={'/'+locale+saved.publicUrl}>{t.publicPage}</Link>}
 {canAddCity&&!overview&&<Link className={s.secondary} href={cityHref}>{t.addCity}</Link>}
 </div></>}
 {status('actions')}
 {preview&&<section className={s.destinationPreview}><h3>{t.preview}</h3>{locales.map(l=><p key={l} lang={l} dir={l==='he'?'rtl':'ltr'}><strong>{languageNames[l]}</strong>: {saved.labels[l]||t.missing}</p>)}</section>}
 {!dirty&&saved.state!=='archived'&&(saved.permissions.publisher&&published||saved.permissions.administrator)&&<details className={s.destinationDetails}><summary>{t.more}</summary><div className={s.actions}>{published&&saved.permissions.publisher&&<button className={s.secondary} disabled={!!busy||refreshFailed} onClick={ev=>begin('withdraw',ev)}>{t.withdraw}</button>}{saved.permissions.administrator&&<button className={s.secondary} disabled={!!busy||refreshFailed} onClick={ev=>begin('archive',ev)}>{t.archive}</button>}{saved.kind==='country'&&<Link className={s.secondary} href={childrenHref}>{t.children}</Link>}</div><p className={s.muted}>{t.publicationHelp}</p></details>}
 </section>}
 <details className={`${s.panel} ${s.destinationDetails}`}><summary>{t.details}</summary><p>{t.translationDeferred}</p>{form.identity&&<p><a href={'https://www.wikidata.org/wiki/'+form.identity.id} target="_blank" rel="noreferrer">{t.wikidata} · {form.identity.id}</a></p>}{saved&&<><p>{t.currentRevision} {saved.number}</p>{saved.reviews.length>0&&<p>{t.legacyReviews}</p>}<details><summary>{a.history}</summary>{saved.history.map(r=><section key={r.id}><h3>{t.currentRevision} {r.number}</h3><p>{r.actor||a.unknown} · {new Date(r.created_at).toLocaleString(locale)}</p>{locales.map(l=><p key={l} lang={l} dir={l==='he'?'rtl':'ltr'}>{languageNames[l]}: {r.labels[l]} · {t[r.provenance[l]?.method]||t.manual}</p>)}</section>)}{saved.events.map((v,i)=><p key={i}>{t[v.action.split(':')[1]]||a.saved} · {v.actor} · {v.reason}</p>)}</details></>}</details>
 <dialog ref={dialog} className={s.destinationDialog} aria-labelledby="destination-dialog-title" onCancel={ev=>{ev.preventDefault();closeDialog();}}><h2 id="destination-dialog-title">{t[dialogAction]}</h2><form noValidate onSubmit={ev=>{ev.preventDefault();persist(dialogAction);}}><div className={s.form}>{dialogAction==='publish'?<><p>{t.geographyHelp}</p>{locales.map(l=><p key={l} lang={l} dir={l==='he'?'rtl':'ltr'}>{languageNames[l]}: {saved?.labels[l]}</p>)}<label className={s.confirmCheck}><input {...inputProps('confirmGeography')} type="checkbox" checked={confirmed} disabled={!!busy} onChange={ev=>setConfirmed(ev.target.checked)}/>{t.confirm}</label>{inline('confirmGeography')}</>:<label className={s.field}>{t.reason}<textarea {...inputProps('reason')} maxLength={1000} value={reason} disabled={!!busy} onChange={ev=>setReason(ev.target.value)}/>{inline('reason')}<small>{t.reasonHelp}</small></label>}{status('dialog')}<div className={s.actions}><button className={s.button} disabled={!!busy||refreshFailed}>{busy?t.pending:t[dialogAction]}</button><button type="button" className={s.secondary} disabled={!!busy} onClick={closeDialog}>{t.cancel}</button></div></div></form></dialog>
 </>;
}
