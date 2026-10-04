'use client';
import {useRef,Suspense} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import {authClient} from './EditorialAuth';
import {adminCopy} from '@/i18n/admin';
import s from './Admin.module.css';
const items=[['dashboard','◈'],['destinations','◎'],['places','▤'],['categories','◇'],['sources','≋'],['translations','文'],['reviews','✓'],['corrections','✉'],['team','♙'],['settings','⚙'],['activity','◷']];
export default function AdminShell({locale,context,identity,passwordDemo,version,versionLabel,children}){
 const t=adminCopy(locale),path=usePathname(),dialog=useRef(null),opener=useRef(null),base=`/${locale}/editor`;
 const current=path.slice(base.length+1).split('/')[0]||'dashboard';
 if(['sign-in','mfa'].includes(current))return children;
 const visible=items.filter(([key])=>!(['team','settings'].includes(key)&&!context.administrator)&&!(key==='corrections'&&!context.grants.some(g=>g.role==='editor')));
 const nav=<nav className={s.nav} aria-label={t.administration}>{visible.map(([key,icon])=><Link key={key} href={key==='dashboard'?base:base+'/'+key} aria-current={current===key||key==='places'&&['branches','new'].includes(current)?'page':undefined} onClick={()=>dialog.current?.close()}><small aria-hidden="true">{icon}</small>{t[key]}</Link>)}</nav>;
 return <div className={s.workspace}><aside className={s.sidebar}><Link className={s.brand} href={base}><span>C</span>{identity.name}</Link>{nav}<div className={s.sidebarFooter}>{identity.tagline}<br/>v{version} · {versionLabel}</div></aside>
 <dialog ref={dialog} className={s.drawer} onClose={()=>opener.current?.focus()}><button className={s.secondary} onClick={()=>dialog.current.close()}>{t.close}</button>{nav}</dialog>
 <div className={s.right}><header className={s.header}><div className={s.actions}><button ref={opener} className={`${s.secondary} ${s.mobileButton}`} aria-label={t.menu} onClick={()=>dialog.current.showModal()}>☰</button><strong>{t.administration}</strong></div><div className={s.headerTools}><Suspense><LanguageSwitcher locale={locale}/></Suspense><details><summary aria-label={t.account}>{context.name}</summary><div className={s.accountPanel}><a className={s.secondary} href={`/${locale}/destinations/italy/rome`}>{t.publicSite}</a><button className={s.secondary} onClick={async()=>{await authClient.signOut();window.location.replace(base+'/sign-in');}}>{t.signOut}</button></div></details></div></header>
 <div className={s.notice}>{t.localDemo} {passwordDemo&&t.passwordMode}</div><main id="main" tabIndex={-1} className={s.main}>{children}</main></div></div>;
}
