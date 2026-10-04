import {createHash} from 'node:crypto';
import {fail,text,editorialLocales} from './editorial-validation.js';

export const sourceHash=input=>createHash('sha256').update(JSON.stringify([input.kind,input.parent||null,input.sourceLocale,input.source,input.mode||'geographic'])).digest('hex');
const itemValues=(item,property)=>(item.claims?.[property]||[]).filter(c=>c.rank!=='deprecated'&&!c.qualifiers?.P582?.length).map(c=>c.mainsnak?.datavalue?.value);
/** Only explicit public field text reaches a provider. No document/notes/session payload is accepted. */
export function translationService({fetcher=fetch,env=process.env}={}) {
 async function wikidata(params){try{const url=new URL('https://www.wikidata.org/w/api.php');url.search=new URLSearchParams({format:'json',...params});const r=await fetcher(url,{headers:{'User-Agent':'CeliTripLocalEditorial/0.2 (local development)'},signal:AbortSignal.timeout(12000),redirect:'error'});if(!r.ok)fail('geographyUnavailable',503);const data=await r.json();if(data.error)fail('geographyUnavailable',503);return data;}catch{fail('geographyUnavailable',503);}}
 return {
  async geography({source,sourceLocale,kind,country,identity}){
   text(source,160);if(!editorialLocales.includes(sourceLocale)||!['country','city'].includes(kind))fail('invalid');
   if(kind==='city'&&!/^Q\d+$/.test(country||''))fail('countryIdentityRequired');
   if(identity&&!/^Q\d+$/.test(identity))fail('invalid');
   const ids=identity?[identity]:(await wikidata({action:'wbsearchentities',search:source,language:sourceLocale,uselang:sourceLocale,type:'item',limit:'15'})).search?.map(x=>x.id)||[];
   if(!ids.length)return [];
   const entities=(await wikidata({action:'wbgetentities',ids:ids.join('|'),props:'info|labels|descriptions|claims',languages:editorialLocales.join('|')})).entities;
   const rows=Object.values(entities||{}).filter(e=>kind==='country'?itemValues(e,'P297').some(v=>typeof v==='string'&&/^[A-Z]{2}$/.test(v)):itemValues(e,'P17').some(v=>v?.id===country)&&itemValues(e,'P625').length&&itemValues(e,'P31').some(v=>['Q515','Q3957','Q1549591','Q1637706','Q15284','Q200126','Q5119','Q518','Q56061'].includes(v?.id)));
   const regionIds=kind==='city'?[...new Set(rows.flatMap(e=>itemValues(e,'P131').map(v=>v?.id).filter(Boolean)))].slice(0,30):[];
   const regions=regionIds.length?(await wikidata({action:'wbgetentities',ids:regionIds.join('|'),props:'labels',languages:editorialLocales.join('|')})).entities||{}:{};
   // Always return candidates for explicit identity confirmation. Labels never use language fallback.
   return rows.map(e=>({identity:{provider:'wikidata',id:e.id,country:kind==='country'?e.id:country,revision:e.lastrevid},labels:Object.fromEntries(editorialLocales.map(l=>[l,e.labels?.[l]?.value||''])),description:e.descriptions?.[sourceLocale]?.value||e.descriptions?.en?.value||'',region:itemValues(e,'P131').map(v=>regions[v?.id]?.labels?.[sourceLocale]?.value||regions[v?.id]?.labels?.en?.value).filter(Boolean).join(' / '),url:'https://www.wikidata.org/wiki/'+e.id}));
  },
  async translate({source,sourceLocale,targets=editorialLocales.filter(l=>l!==sourceLocale)}){
   source=text(source,2000);if(!editorialLocales.includes(sourceLocale)||!targets.length||targets.some(l=>!editorialLocales.includes(l)||l===sourceLocale))fail('invalid');
   if(env.CELITRIP_TRANSLATION_PROVIDER!=='deepl'||!env.DEEPL_API_KEY)fail('translationNotConfigured',503);
   const origin=env.CELITRIP_DEEPL_PLAN==='pro'?'https://api.deepl.com':'https://api-free.deepl.com';
   try{return Object.fromEntries(await Promise.all(targets.map(async locale=>{const r=await fetcher(origin+'/v2/translate',{method:'POST',headers:{Authorization:'DeepL-Auth-Key '+env.DEEPL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({text:[source],source_lang:sourceLocale.toUpperCase(),target_lang:locale==='en'?'EN-GB':locale.toUpperCase(),model_type:'quality_optimized'}),signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok)fail('translationFailed',503);const data=await r.json();return [locale,text(data.translations?.[0]?.text,2000)];})));}catch{fail('translationFailed',503);}
  }
 };
}
