import {headers} from 'next/headers';
import Link from 'next/link';
import {copy,locales} from '@/i18n/copy';
import {destinationPath} from '@/components/Journey';
import s from '@/components/Journey.module.css';
export default async function NotFound(){const value=(await headers()).get('x-celitrip-locale');const locale=locales.includes(value)?value:'en',t=copy(locale);return <section className={s.empty}><h1>{t.notFound}</h1><p>{t.notFoundText}</p><Link className={s.button} href={destinationPath(locale)}>{t.home}</Link></section>;}
