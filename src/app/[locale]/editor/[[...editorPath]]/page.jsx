import DestinationEditor from '@/components/DestinationEditor';
import {destinations} from '@/server/destinations';
import {headers} from 'next/headers';
import {connection} from 'next/server';
import {notFound,redirect} from 'next/navigation';
import {Suspense} from 'react';
import {auth} from '@/server/auth';
import {pool} from '@/server/db';
import {editorialSession,DomainError} from '@/server/editorial-service';
import {administration} from '@/server/administration';
import {localDemoRequest} from '@/server/local-demo-auth';
import {locales} from '@/i18n/copy';
import {editorialCopy} from '@/i18n/editorial';
import {adminCopy} from '@/i18n/admin';
import EditorialAuth from '@/components/EditorialAuth';
import EditorialStudio from '@/components/EditorialStudio';
import AdminWorkspace from '@/components/AdminWorkspace';
import LanguageSwitcher from '@/components/LanguageSwitcher';
const service=administration(pool);
export const runtime='nodejs';
export const metadata={title:'CeliTrip · Administration',robots:{index:false,follow:false}};
const serial=value=>JSON.parse(JSON.stringify(value));
export default async function EditorialPage({params,searchParams}){
 await connection();const {locale,editorPath=[]}=await params;if(!locales.includes(locale))notFound();let route=editorPath.join('/');const q=await searchParams;
 const requestHeaders=await headers(),demoPasswordOnly=localDemoRequest(requestHeaders);
 const login=(mode,enrolled=false)=><main id="main" style={{padding:'24px'}}><Suspense><LanguageSwitcher locale={locale}/></Suspense><EditorialAuth locale={locale} mode={mode} enrolled={enrolled} demoPasswordOnly={demoPasswordOnly}/></main>;
 if(route==='sign-in')return login('sign-in');
 const session=await auth.api.getSession({headers:requestHeaders});const p=session?{userId:session.user.id,sessionId:session.session.id,requestHeaders}:null;let admitted=false;
 if(p){try{await editorialSession(pool,p);admitted=true;}catch(e){if(!(e instanceof DomainError))throw e;}}
 if(route==='mfa'){if(admitted)redirect(`/${locale}/editor`);return login('mfa',!session||session.user.twoFactorEnabled);}
 if(!session)redirect(`/${locale}/editor/sign-in`);if(!admitted)redirect(`/${locale}/editor/mfa`);
 if(route==='access')redirect(`/${locale}/editor/team`);
 if(editorPath[0]==='branches'&&editorPath[2]==='edit')redirect(`/${locale}/editor/branches/${editorPath[1]}/details`);
 let context,catalog,data,record,mode,error;
 try{
  context=await service.context(p);catalog=await service.catalog(p);
  if(editorPath[0]==='destinations'&&editorPath.length===2){
   if(editorPath[1]==='new'){if(!context.administrator&&!catalog.destinations.some(d=>d.kind==='country'&&d.entity_id===q.parent&&d.canCreate&&d.state!=='archived'))throw new DomainError('forbidden',403);record=null;}else record=await destinations(pool).read(p,editorPath[1]);
   mode='destination';
  }else if(route==='new'){
   catalog.destinations=catalog.destinations.filter(d=>d.canCreate&&d.state!=='archived');
   if(!catalog.destinations.some(d=>d.kind==='city'))throw new DomainError('forbidden',403);
   mode='new';
  }else if(editorPath[0]==='branches'&&editorPath.length===3&&['details','evidence','translations','review','preview','history'].includes(editorPath[2])){
   record=(await service.records(p)).find(r=>r.id===editorPath[1]);if(!record)notFound();mode=editorPath[2];
  }else{
   route=route||'dashboard';if(!['dashboard','places','destinations','categories','sources','translations','reviews','corrections','team','settings','activity'].includes(route))notFound();
   data=await service.read(p,route,{...q,uiLocale:locale});
  }
 }catch(e){if(!(e instanceof DomainError))throw e;error=e.code;}
 const content=error?<section><h1>{adminCopy(locale).administration}</h1><p role="alert">{adminCopy(locale)[error]||editorialCopy(locale)[error]}</p></section>:mode==='destination'?<DestinationEditor key={record?.entity_id||'new'} locale={locale} record={record?serial(record):null} catalog={serial(catalog)} q={q} context={context}/>:mode?<EditorialStudio locale={locale} mode={mode} record={record?serial(record):null} catalog={serial(catalog)} context={context} language={q.language}/>:<AdminWorkspace key={route+JSON.stringify(q)} locale={locale} view={route} data={serial(data)} catalog={serial(catalog)} context={context} q={q}/>;
 return content;
}
