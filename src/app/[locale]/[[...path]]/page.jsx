import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {connection} from 'next/server';
import {content} from '@/server/db';
import {categories,dimensions,filtersFrom,filterQuery} from '@/server/repository';
import {copy,locales} from '@/i18n/copy';
import {Hero,PlaceCard,Claim,Icon,Badges,destinationPath,placePath} from '@/components/Journey';
import s from '@/components/Journey.module.css';
export const runtime='nodejs';
export async function generateMetadata({params}) {const {locale}=await params;return {title:`${copy(locale).rome} · CeliTrip · ${copy(locale).fictional}`};}
export default async function JourneyPage({params,searchParams}) {
  await connection();
  const {locale,path=[]}=await params;if(!locales.includes(locale))notFound();
  const t=copy(locale),route=path.join('/'),filters=filtersFrom(await searchParams),query=filterQuery(filters),base=destinationPath(locale);
  if(!route)redirect(base);
  if(route==='destinations/italy/rome') {
    const destination=await content.entity('rome',locale);if(!destination)notFound();
    return <><Hero destination={destination} locale={locale}/><div className={s.sectionHead}><h2>{t.places}</h2><Link className={s.button} href={base+'/places'+query}>{t.browse}</Link></div>
    <section className={s.panel}><div className={s.feature}><Icon type="evidence"/><div><h2>{t.why}</h2><p className={s.intro}>{t.whyText}</p></div></div></section></>;
  }
  if(route==='destinations/italy/rome/places') {
    const places=await content.places(locale,filters);
    return <><Link className={s.textLink} href={base+query}>{t.home}</Link><div className={s.sectionHead}><div><span className={s.eyebrow}>{t.italy} / {t.rome}</span><h1>{t.places}</h1></div><span className={s.subtle}>{places.length} {t.results}</span></div>
    <form className={s.filters} action={base+'/places'} method="get"><label>{t.search}<input name="q" defaultValue={filters.q} maxLength={80}/></label>
    <label>{t.all}<select name="category" defaultValue={filters.category}><option value="">{t.all}</option>{categories.map(c=><option key={c} value={c}>{t[c]}</option>)}</select></label>
    <label>{t.dimension}<select name="dimension" defaultValue={filters.dimension}><option value="">{t.any}</option>{dimensions.map(d=><option key={d} value={d}>{t[d]}</option>)}</select></label><button className={s.button}>{t.apply}</button></form>
    <Link className={s.textLink} href={base+'/places'}>{t.reset}</Link>
    {places.length?<div className={s.cards}>{places.map(place=><PlaceCard key={place.id} place={place} locale={locale} filters={filters}/>)}</div>:<section className={s.empty}><h2>{t.empty}</h2><p>{t.emptyText}</p><Link className={s.button} href={base+'/places'}>{t.reset}</Link></section>}</>;
  }
  if(path[0]==='places' && (path.length===2 || (path.length===3 && path[2]==='evidence'))) {
    const place=await content.entity(path[1],locale);if(!place||place.kind!=='branch')notFound();
    const claims=await content.evidence(place.id,locale);const evidence=path.length===3;
    return <><Link className={s.textLink} href={(evidence?placePath(locale,place.id):base+'/places')+query}>{evidence?t.backPlace:t.backList}</Link>
    {evidence?<><div className={s.eyebrow}>{place.title}</div><h1>{t.evidence}</h1><p className={s.intro}>{t.evidenceIntro}</p></>:<>
    <section className={s.detailHead}><div className={s.illustration}><Icon type="bread"/><span>{t.illustration}</span></div><div><Badges values={place.categories} locale={locale}/><h1>{place.title}</h1><p>{place.summary}</p><Link className={s.button} href={placePath(locale,place.id)+'/evidence'+query}>{t.readEvidence}</Link></div></section>
    <section className={s.notice}><strong>{t.profile}: {t.unknown}</strong><p>{t.profileText}</p><span>{t.address}: {place.address||t.notRecorded}</span></section><h2>{t.claims}</h2></>}
    {claims.map(claim=><Claim key={claim.id} claim={claim} locale={locale} full={evidence}/>)}
    {evidence && <p className={s.notice}>{t.policy}</p>}</>;
  }
  notFound();
}
