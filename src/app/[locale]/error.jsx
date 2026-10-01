'use client';
import {useParams,useRouter} from 'next/navigation';
import {copy} from '@/i18n/copy';
import s from '@/components/Journey.module.css';
export default function ErrorPage({reset}){const t=copy(useParams().locale),router=useRouter();return <section className={s.empty} role="alert"><h1>{t.error}</h1><p>{t.errorText}</p><button className={s.button} onClick={()=>{router.refresh();reset();}}>{t.retry}</button></section>;}
