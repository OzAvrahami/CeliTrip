import { headers } from 'next/headers';
import { Suspense } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Icon,destinationPath } from '@/components/Journey';
import {copy,locales} from '@/i18n/copy';
import version from '../../VERSION.json';
import s from '@/components/Shell.module.css';
import '@/styles/globals.css';
export const metadata = {title:'CeliTrip · Local demonstration',robots:{index:false,follow:false}};
export default async function Layout({children}) {
  const incoming=(await headers()).get('x-celitrip-locale'); const locale=locales.includes(incoming)?incoming:'en';const t=copy(locale);
  return <html lang={locale} dir={locale==='he'?'rtl':'ltr'}><body>
    <a href="#main" className={s.skip}>{t.skip}</a><header className={s.header}><div className={s.bar}>
    <Link className={s.logo} href={destinationPath(locale)}><span className={s.mark}><Icon/></span>CeliTrip</Link>
    <nav className={s.nav} aria-label={t.guide}><Link href={destinationPath(locale)}>{t.rome}</Link><Link href={destinationPath(locale)+'/places'}>{t.places}</Link></nav>
    <Suspense><LanguageSwitcher locale={locale}/></Suspense></div></header>
    <aside className={s.banner}>{t.demo}</aside><main id="main" className={s.main}>{children}</main>
    <footer className={s.footer}><span>{t.footer}</span><span className={s.version}>v{version.version} · {version.status}</span></footer>
  </body></html>;
}
