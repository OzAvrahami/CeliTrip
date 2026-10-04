import {headers} from 'next/headers';
import {adminCopy} from '@/i18n/admin';
export default async function Loading(){const locale=(await headers()).get('x-celitrip-locale');return <section role="status" style={{padding:32}}><h1>{adminCopy(locale).loading}</h1></section>;}
