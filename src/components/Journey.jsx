import Link from 'next/link';
import s from './Journey.module.css';
import { copy } from '@/i18n/copy';
import { filterQuery } from '@/server/repository';

export const destinationPath = (locale) => `/${locale}/destinations/italy/rome`;
export const placePath = (locale,id) => `/${locale}/places/${id}`;
export function Icon({type='compass'}) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{type==='bread'?<><path d="M4 10c-4-5 4-9 8-5 4-4 12 0 8 5v10H4z"/><path d="M8 9v5m4-5v5m4-5v5"/></>:type==='evidence'?<><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6m-6 4h6m-6 4h3"/></>:<><path d="m21 3-6 18-4-8-8-4Z"/><path d="m11 13 10-10"/></>}</svg>;
}
export function Badges({values,locale}) {const t=copy(locale);return <div className={s.badges}>{values.map(value=><span className={s.badge} data-dimension={value} key={value}>{t[value]}</span>)}</div>;}
export function Hero({destination,locale}) {const t=copy(locale);return <section className={s.hero}><div className={s.heroCopy}><span className={s.eyebrow}>{t.italy} / {t.guide}</span><h1>{destination.title}<span>.</span></h1><p>{destination.summary}</p></div></section>;}
export function PlaceCard({place,locale,filters}) {const t=copy(locale);return <article className={s.card} data-place={place.id}>
  <div className={s.illustration}><Icon type="bread"/><span>{t.fictional}</span></div><div className={s.cardBody}>
  <Badges values={place.categories} locale={locale}/><h2>{place.title}</h2><p>{place.summary}</p><Badges values={place.dimensions} locale={locale}/>
  <Link className={s.textLink} href={placePath(locale,place.id)+filterQuery(filters)}>{t.details} <span aria-hidden="true">↗</span></Link></div>
  </article>;}
export function Claim({claim,locale,full=false}) {const t=copy(locale);return <article className={s.panel} id={claim.id} data-claim={claim.id}>
  <Badges values={claim.dimensions} locale={locale}/><h2>{claim.copy.title}</h2><p>{claim.copy.summary}</p>
  <p className={s.scope}>{t.scope}: <strong>{t[claim.scope]}</strong></p>
  {full && (claim.observations.length ? claim.observations.map(o=><section className={s.observation} key={o.id}>
    <span className={s.eyebrow}>{t[o.stance]}</span><h3>{o.source}</h3><p>{o.statement}</p>
    <dl className={s.facts}>{[
      [t.sourceScope,t[o.sourceType==='chain'?'chain':'branch']], [t.sourceRevision,o.sourceRevision],
      [t.source,o.url||t.notRecorded], [t.publicationDate,o.publishedOn||t.notRecorded], [t.observed,o.observedOn||t.notRecorded],
      [t.verified,o.verifiedOn||t.noVerification], [t.method,o.verificationMethod||t.notRecorded],
      [t.effective,o.effectiveOn||t.notRecorded], [t.expiry,o.expiresOn||t.notRecorded]
    ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  </section>):<p className={s.notice}>{t.noObservations}</p>)}
  </article>;}
