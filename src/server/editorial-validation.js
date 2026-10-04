import {categories,dimensions} from './repository.js';
export const editorialLocales=['he','en','fr','ru'];
export class DomainError extends Error { constructor(code,status=400){super(code);this.code=code;this.status=status;} }
export const fail=(code,status)=>{throw new DomainError(code,status);};
export function text(value,max=2000,min=1){if(typeof value!=='string'||value.trim().length<min||value.length>max)fail('invalid');return value.trim();}
const nullable=value=>value===''||value==null?null:text(value,500);
function date(value){if(!value)return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(new Date(value).getTime())||new Date(value).toISOString().slice(0,10)!==value)fail('invalid');return value;}
const translated=(value,block=false,draft=false)=>Object.fromEntries(editorialLocales.map(l=>[l,block?{title:text(value?.[l]?.title??'',160,draft?0:1),summary:text(value?.[l]?.summary??'',2000,draft?0:1)}:text(value?.[l]??'',1000,draft?0:1)]));
export function translationComplete(doc,locale){return [doc.translations?.[locale]?.title,doc.translations?.[locale]?.summary,...doc.claims.flatMap(c=>[c.copy?.[locale]?.title,c.copy?.[locale]?.summary,...c.observations.flatMap(o=>[o.title?.[locale],o.statement?.[locale]])])].every(v=>typeof v==='string'&&v.trim());}
/** Normalize and bound all data before an immutable snapshot is written. Dates remain null if unknown. */
export function validateDocument(input,entity,now=new Date(),options={}){
  if(!input||input.fictional!==true)fail('fictionalOnly');
  if(!Array.isArray(input.categories)||!input.categories.length||input.categories.some(c=>!(options.categories||categories).includes(c)))fail('invalid');
  if(!Array.isArray(input.claims)||input.claims.length<1||input.claims.length>20)fail('invalid');
  const claims=input.claims.map(c=>{
    if(![entity.id,entity.chain_id].filter(Boolean).includes(c.subject))fail('wrongScope');
    if(![true,false,null].includes(c.value)||!Array.isArray(c.dimensions)||c.dimensions.some(d=>!dimensions.includes(d)))fail('invalid');
    const ds=[...new Set(c.dimensions)];
    if(ds.includes('chain_scope')!==(c.subject===entity.chain_id))fail('wrongScope');
    if(c.value===null&&!ds.some(d=>['unknown','conflicting'].includes(d)))fail('uncertainty');
    if(c.value===true&&ds.some(d=>['historical','needs_review','conflicting','chain_scope','unknown'].includes(d)))fail('uncertainty');
    if(!Array.isArray(c.observations)||c.observations.length>20)fail('invalid');
    const observations=c.observations.map(o=>{
      if(o.subject!==c.subject)fail('wrongScope');
      if(!['venue','chain','historical_record','traveler'].includes(o.type)||!['supports','contradicts','unresolved'].includes(o.stance))fail('invalid');
      if((o.type==='chain')!==(o.subject===entity.chain_id))fail('wrongScope');
      const url=nullable(o.url);if(url){let u;try{u=new URL(url);}catch{fail('invalid');}if(!['https:','http:'].includes(u.protocol)||u.username||u.password)fail('invalid');}
      const expiresOn=date(o.expiresOn),publishedOn=date(o.publishedOn),observedOn=date(o.observedOn),effectiveOn=date(o.effectiveOn);
      if(expiresOn&&expiresOn<now.toISOString().slice(0,10)&&!ds.includes('needs_review'))fail('staleEvidence');
      if(o.type==='historical_record'&&!ds.includes('historical'))fail('uncertainty');
      // This milestone cannot manufacture actual independent verification.
      if(o.verifiedOn||o.verificationMethod)fail('fictionalOnly');
      return {sourceKey:text(o.sourceKey,100),subject:o.subject,type:o.type,title:translated(o.title,false,options.draft),url,publishedOn,observedOn,effectiveOn,expiresOn,stance:o.stance,statement:translated(o.statement,false,options.draft),verifiedOn:null,verificationMethod:null};
    });
    if(observations.some(o=>o.stance==='supports')&&observations.some(o=>o.stance==='contradicts')&&!ds.includes('conflicting'))fail('uncertainty');
    if(c.value===true&&!observations.some(o=>o.stance==='supports'))fail('uncertainty');
    return {key:text(c.key,100),subject:c.subject,predicate:text(c.predicate,100),value:c.value,dimensions:ds,copy:translated(c.copy,true,options.draft),observations};
  });
  if(new Set(claims.map(c=>c.key)).size!==claims.length)fail('invalid');
  return {fictional:true,categories:[...new Set(input.categories)],address:nullable(input.address),translations:translated(input.translations,true,options.draft),claims};
}
