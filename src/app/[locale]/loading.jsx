'use client';
import {useParams} from 'next/navigation';
import {copy} from '@/i18n/copy';
import s from '@/components/Journey.module.css';
export default function Loading(){const t=copy(useParams().locale);return <section role="status" aria-live="polite"><h1>{t.loading}</h1><div className={s.skeleton}/><div className={s.skeleton}/></section>;}
