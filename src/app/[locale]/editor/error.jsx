'use client';
import {useParams} from 'next/navigation';
import {adminCopy} from '@/i18n/admin';
export default function Error({reset}){const {locale}=useParams(),t=adminCopy(locale);return <section role="alert" style={{padding:32}}><h1>{t.error}</h1><button onClick={reset}>{t.retry}</button></section>;}
