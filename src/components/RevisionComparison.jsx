import {editorialCopy} from '@/i18n/editorial';
import {copy,languageNames} from '@/i18n/copy';
import s from './Editorial.module.css';
/** Compare every stored leaf, including translated claims, source dates and contradictory observations. */
export default function RevisionComparison({previous,current,locale}){
 const t=editorialCopy(locale),pub=copy(locale);
 const flatten=(value,path=[],result={})=>{if(value!==null&&typeof value==='object'){for(const [k,v]of Object.entries(value))flatten(v,[...path,k],result);}else result[path.join('.')]=value;return result;};
 const before=flatten(previous||{}),after=flatten(current||{}),keys=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>before[k]!==after[k]&&!/(^|\.)(key|sourceKey|subject|revisionId|sourceRevisionId)$/.test(k));
 const label=key=>key.split('.').map(k=>languageNames[k]||t[k]||pub[k]||({copy:t.translations,key:t.predicate,subject:t.scope,sourceKey:t.sourceKey,fictional:t.demo}[k])||(/^\d+$/.test(k)?Number(k)+1:k)).join(' / ');
 const value=v=>v==null?t.unknown:typeof v==='boolean'?(v?t.yes:t.no):(pub[v]||String(v));
 return <div className={s.list}>{keys.length?keys.map(k=><section className={s.card} key={k}><h3>{label(k)}</h3><div className={s.grid}><div><strong>{t.previous}</strong><p dir="auto">{value(before[k])}</p></div><div><strong>{t.current}</strong><p dir="auto">{value(after[k])}</p></div></div></section>):<p>{t.empty}</p>}</div>;
}
