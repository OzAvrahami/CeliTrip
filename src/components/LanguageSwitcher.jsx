'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { languageNames, locales, copy } from '@/i18n/copy';
import { filterQuery, filtersFrom } from '@/server/repository';
export default function LanguageSwitcher({locale}) {
  const pathname=usePathname(), params=useSearchParams();
  return <select aria-label={copy(locale).language} value={locale} onChange={event=>{
    const route=pathname.split('/'); route[1]=event.target.value;
    // A document navigation updates server-rendered html lang/dir and the entire shell atomically.
    window.location.assign(route.join('/')+filterQuery(filtersFrom(Object.fromEntries(params)))+window.location.hash);
  }}>{locales.map(l=><option key={l} value={l} lang={l}>{languageNames[l]}</option>)}</select>;
}
