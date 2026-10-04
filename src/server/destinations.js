import {randomUUID} from 'node:crypto';
import {authorize,transaction} from './editorial-service.js';
import {fail,editorialLocales,DomainError} from './editorial-validation.js';
import {localConfig} from './local-config.js';
import {sourceHash,translationService} from './translation-service.js';

const roles=['editor','subject_reviewer','language_reviewer','publisher','administrator'];
/** Existing scoped roles apply. A local catalog administrator may exercise only their own
 * explicitly assigned demo role for new destinations, outside the original Rome subtree. */
export async function destinationAccess(db,p,required,id='rome',locale='*'){
 localConfig();
 try{return await authorize(db,p,required,id,locale);}catch(e){if(!(e instanceof DomainError)||e.code!=='forbidden')throw e;}
 await authorize(db,p,['administrator']);return authorize(db,p,required,'rome',locale);
}
const event=(db,p,id,action,reason)=>db.query('INSERT INTO editorial_audit(actor_id,entity_id,action,reason) VALUES($1,$2,$3,$4)',[p.userId,id,'destination:'+action,reason||'Geographic metadata action']);
function field(code,key){const e=new DomainError(code);e.fields={[key]:code};throw e;}
function value(v,key,max=160,min=0){if(typeof v!=='string'||v.length>max||v.trim().length<min)field(key.startsWith('labels.')?'nameRequired':key==='reason'?'reasonRequired':key==='parent'?'parentInvalid':key==='internalNote'?'noteInvalid':'fieldInvalid',key);return v.trim();}
function geographyOnly(input){if(['claims','guidance','content','translations','document','contentRevision','publicationRevision'].some(k=>Object.hasOwn(input,k)))fail('geographyOnly');}
function requireNames(r){for(const l of editorialLocales)if(!r.labels[l]?.trim())field('nameRequired','labels.'+l);}
const complete=r=>editorialLocales.every(l=>r.labels[l]?.trim());
async function head(db,id,lock=false){const r=(await db.query(`SELECT d.*,e.parent_id,r.source_locale,r.provenance,r.identity,r.number,r.created_at,COALESCE(r.internal_note,(SELECT a.reason FROM editorial_audit a WHERE a.entity_id=d.entity_id AND a.action='destination:save' AND a.created_at<=r.created_at ORDER BY a.id DESC LIMIT 1),'') AS internal_note,p.revision_id AS published_revision,legacy.revision_id AS legacy_publication FROM admin_destination d JOIN entity e ON e.id=d.entity_id JOIN destination_revision r ON r.id=d.revision_id LEFT JOIN destination_publication p ON p.entity_id=d.entity_id LEFT JOIN publication legacy ON legacy.entity_id=d.entity_id WHERE d.entity_id=$1 ${lock?'FOR UPDATE OF d':''}`,[id])).rows[0];if(!r)fail('notFound',404);return r;}
async function reviews(db,r){const raw=(await db.query('SELECT v.*,u.name AS actor FROM destination_review v JOIN "user" u ON u.id=v.actor_id WHERE revision_id=$1 AND cycle=$2 ORDER BY v.id',[r.revision_id,r.cycle])).rows;const valid=[];
 for(const v of raw){if((await db.query('SELECT 1 FROM admin_access WHERE user_id=$1 AND disabled',[v.actor_id])).rowCount)continue;
 const grant=(await db.query(`SELECT 1 FROM editorial_grant g WHERE user_id=$1 AND role=$2 AND locale=$3 AND (editorial_scope_contains(scope,$4) OR (scope='rome' AND EXISTS(SELECT 1 FROM editorial_grant a WHERE a.user_id=g.user_id AND a.role='administrator' AND a.scope='rome')))`,[v.actor_id,v.kind==='subject'?'subject_reviewer':'language_reviewer',v.locale,r.entity_id])).rowCount;if(grant)valid.push(v);
 }return valid;
}
async function isPublic(db,id){return !!(await db.query('SELECT 1 FROM destination_publication WHERE entity_id=$1 UNION ALL SELECT 1 FROM publication WHERE entity_id=$1',[id])).rowCount;}
export function destinations(pool,{translator=translationService()}={}){
 async function read(p,id){await destinationAccess(pool,p,roles,id);const r=await head(pool,id);const approved=await reviews(pool,r);const permissions={};for(const role of roles){try{await destinationAccess(pool,p,[role],id);permissions[role]=true;}catch(e){if(!(e instanceof DomainError))throw e;}}
  permissions.languages=[];for(const l of editorialLocales){try{await destinationAccess(pool,p,['language_reviewer'],id,l);permissions.languages.push(l);}catch(e){if(!(e instanceof DomainError))throw e;}}
  const blockers=[];if(r.state==='archived')blockers.push('archived');if(!complete(r))blockers.push('missingNames');if(r.parent_id&&!await isPublic(pool,r.parent_id))blockers.push('parentNotPublished');
  const history=(await pool.query('SELECT r.*,u.name AS actor FROM destination_revision r LEFT JOIN "user" u ON u.id=r.actor_id WHERE entity_id=$1 ORDER BY number DESC',[id])).rows;
  const events=(await pool.query("SELECT a.action,a.reason,a.created_at,u.name AS actor FROM editorial_audit a LEFT JOIN \"user\" u ON u.id=a.actor_id WHERE entity_id=$1 AND action LIKE 'destination%' ORDER BY a.id DESC",[id])).rows;
  return {...r,reviews:approved,permissions,blockers,history,events,publicUrl:r.entity_id==='rome'?'/destinations/italy/rome':'/destinations/'+r.entity_id};
 }
 async function generation(p,input){const id=input.id||null;await destinationAccess(pool,p,['editor','administrator'],id||(input.kind==='city'?input.parent:'rome'));
  const sourceLocale=input.sourceLocale;if(!editorialLocales.includes(sourceLocale))field('sourceLanguageInvalid','sourceLocale');if(!['country','city'].includes(input.kind))field('kindInvalid','kind');const source=value(input.source,'labels.'+sourceLocale,160,1);
  const mode=input.mode==='fictional'?'fictional':'geographic',parent=input.kind==='city'?value(input.parent,'parent',100,1):null;
  if(id){const r=await head(pool,id);if(r.revision_id!==input.expected||r.version!==input.version)fail('conflict',409);if(r.state==='archived')fail('invalidState');}
  const rate=(await pool.query(`INSERT INTO translation_throttle(actor_id,requests) VALUES($1,1) ON CONFLICT(actor_id) DO UPDATE SET requests=CASE WHEN translation_throttle.window_start<now()-interval '1 minute' THEN 1 ELSE translation_throttle.requests+1 END,window_start=CASE WHEN translation_throttle.window_start<now()-interval '1 minute' THEN now() ELSE translation_throttle.window_start END RETURNING requests`,[p.userId])).rows[0];if(rate.requests>20)fail('rateLimited',429);
  let result,provider;
  if(mode==='geographic'){
   let country=null;if(parent){await destinationAccess(pool,p,roles,parent);const pr=await head(pool,parent);if(pr.kind!=='country'||pr.state==='archived')field('parentInvalid','parent');country=pr.identity?.id;}
   const candidates=await translator.geography({source,sourceLocale,kind:input.kind,country,identity:input.identity});
   if(!input.identity)return {candidates,sourceHash:sourceHash({kind:input.kind,parent,sourceLocale,source,mode})};
   if(candidates.length!==1)fail('identityNotFound');result=candidates[0];provider='wikidata';
  }else{result={labels:{...await translator.translate({source,sourceLocale}),[sourceLocale]:source},identity:null};provider='deepl';}
  // A slow provider cannot apply to a concurrently saved source revision.
  await destinationAccess(pool,p,['editor','administrator'],id||(input.kind==='city'?input.parent:'rome'));if(id){const latest=await head(pool,id);if(latest.revision_id!==input.expected||latest.version!==input.version)fail('conflict',409);}
  result.labels[sourceLocale]=source;const hash=sourceHash({kind:input.kind,parent,sourceLocale,source,mode}),receipt=randomUUID();
  await pool.query('INSERT INTO translation_generation(id,actor_id,entity_id,base_revision,source_hash,source_locale,provider,result) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[receipt,p.userId,id,id?input.expected:null,hash,sourceLocale,provider,result]);
  return {...result,receipt,sourceHash:hash,provider};
 }
 async function save(p,input){return transaction(pool,async db=>{
  geographyOnly(input);
  const id=input.id||'demo-destination-'+randomUUID();await destinationAccess(db,p,['editor','administrator'],input.id||(input.kind==='city'?input.parent:'rome'));
  if(!input.id&&input.kind!=='city')await authorize(db,p,['administrator']);
  const old=input.id?await head(db,id,true):null;if(old&&(old.version!==input.version||old.revision_id!==input.expected))fail('conflict',409);
  if(input.state&&input.state!=='draft'||input.archived)fail('explicitActionRequired');if(old?.state==='archived')fail('invalidState');
  if(!['country','city'].includes(input.kind)||old&&old.kind!==input.kind)field('kindInvalid','kind');
  const parent=input.kind==='city'?value(input.parent,'parent',100,1):null;
  if(parent){await destinationAccess(db,p,roles,parent);const pr=await head(db,parent,true);if(pr.kind!=='country'||pr.state==='archived')field('parentInvalid','parent');}
  if(old&&old.parent_id!==parent)fail('referencesInUse');
  const sourceLocale=input.sourceLocale||'en';if(!editorialLocales.includes(sourceLocale))field('sourceLanguageInvalid','sourceLocale');
  const labels=Object.fromEntries(editorialLocales.map(l=>[l,value(input.labels?.[l]??'','labels.'+l,160,l===sourceLocale?1:0)]));const source=labels[sourceLocale],mode=input.mode==='fictional'?'fictional':'geographic';
  if(input.manualLocales&&(!Array.isArray(input.manualLocales)||input.manualLocales.some(l=>!editorialLocales.includes(l))))fail('invalid');
  const hash=sourceHash({kind:input.kind,parent,sourceLocale,source,mode});let receipt;
  if(input.receipt){receipt=(await db.query('SELECT * FROM translation_generation WHERE id=$1 AND actor_id=$2',[input.receipt,p.userId])).rows[0];if(!receipt||receipt.source_hash!==hash||receipt.entity_id!==(input.id||null)||receipt.base_revision!==(old?.revision_id||null))fail('staleTranslation',409);}
  const validReviews=old?await reviews(db,old):[];
  const provenance={};for(const l of editorialLocales){const previous=old?.provenance?.[l];
   if(old&&labels[l]===old.labels[l]){provenance[l]=previous||{method:'manual'};continue;}
   const generated=l!==sourceLocale&&receipt?.result.labels[l]===labels[l]&&!input.manualLocales?.includes(l);
   if(generated&&old?.labels[l]&&(previous?.method?.includes('manual')||validReviews.some(v=>v.locale===l)))fail('protectedTranslation',409);
   provenance[l]={method:l===sourceLocale?'source':generated?receipt.provider:'manual',sourceHash:hash,...(generated?{receipt:receipt.id,generatedAt:receipt.created_at}:{} )};
  }
  let identity=receipt?.result.identity||old?.identity||null;
  if(old&&old.labels[old.source_locale]!==source&&!receipt)identity=null;
  if(mode==='fictional')identity=null;
  const revision=randomUUID(),number=(old?.number||0)+1,version=(old?.version||0)+1;
  const note=value(input.internalNote??input.reason??old?.internal_note??'','internalNote',1000);
  provenance[sourceLocale]={...provenance[sourceLocale],namingMode:mode};
  for(const value of Object.values(provenance))if(value.sourceHash===hash&&!value.sourceRevision)value.sourceRevision=revision;
  if(!old)await db.query("INSERT INTO entity(id,kind,parent_id) VALUES($1,'destination',$2)",[id,parent]);
  await db.query('INSERT INTO destination_revision(id,entity_id,number,source_locale,labels,provenance,identity,actor_id,internal_note) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[revision,id,number,sourceLocale,labels,provenance,identity,p.userId,note]);
  await db.query(`INSERT INTO admin_destination(entity_id,kind,labels,version,revision_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(entity_id) DO UPDATE SET labels=$3,version=$4,revision_id=$5,review_state='draft',cycle=admin_destination.cycle+1,updated_at=now()`,[id,input.kind,labels,version,revision]);
  await db.query('INSERT INTO admin_history(kind,target,version,actor_id,snapshot) VALUES($1,$2,$3,$4,$5)',['destination',id,version,p.userId,{revision,labels,sourceLocale,provenance,identity}]);
  await event(db,p,id,'save',note);return {id,revision};
 });}
 async function transition(p,input){return transaction(pool,async db=>{
  geographyOnly(input);const {id,action,locale}=input;const role={submit:'editor',return:'subject_reviewer',subject:'subject_reviewer',language:'language_reviewer',publish:'publisher',withdraw:'publisher',archive:'administrator',restore:'administrator'}[action];if(!role)fail('invalid');
  await destinationAccess(db,p,[role],id,action==='language'?locale:'*');
  const r=await head(db,id,true);if(r.revision_id!==input.expected||r.version!==input.version||r.cycle!==input.cycle)fail('conflict',409);const reason=['withdraw','archive','return'].includes(action)?value(input.reason,'reason',1000,5):value(input.reason??'','reason',1000);
  if(r.state==='archived'&&action!=='restore')fail('invalidState');
  if(action==='archive'){
   if(await isPublic(db,id)||(await db.query('SELECT 1 FROM entity WHERE parent_id=$1',[id])).rowCount)fail('referencesInUse');
   await db.query("UPDATE admin_destination SET state='archived',version=version+1 WHERE entity_id=$1",[id]);
  }else if(action==='restore')await db.query("UPDATE admin_destination SET state='draft',review_state='draft',cycle=cycle+1,version=version+1 WHERE entity_id=$1",[id]);
  else if(action==='withdraw'){
   if(!await isPublic(db,id))fail('notPublished');
   if((await db.query('SELECT 1 FROM entity e WHERE parent_id=$1 AND (EXISTS(SELECT 1 FROM destination_publication p WHERE p.entity_id=e.id) OR EXISTS(SELECT 1 FROM publication p WHERE p.entity_id=e.id))',[id])).rowCount)fail('referencesInUse');
   await db.query('DELETE FROM destination_publication WHERE entity_id=$1',[id]);await db.query('DELETE FROM publication WHERE entity_id=$1',[id]);
   await db.query("UPDATE admin_destination SET review_state='withdrawn',cycle=cycle+1,version=version+1 WHERE entity_id=$1",[id]);
  }else if(action==='publish'){
   if(input.confirmGeography!==true)field('confirmationRequired','confirmGeography');
   requireNames(r);
   if(r.parent_id){await head(db,r.parent_id,true);if(!await isPublic(db,r.parent_id))fail('parentNotPublished');}
   // This pointer can reference ONLY destination_revision (labels/identity/hierarchy).
   // Never touch content_revision, claim_revision, translation_revision or publication.
   await db.query('INSERT INTO destination_publication(entity_id,revision_id) VALUES($1,$2) ON CONFLICT(entity_id) DO UPDATE SET revision_id=$2',[id,r.revision_id]);
   await db.query("UPDATE admin_destination SET review_state='published',version=version+1 WHERE entity_id=$1",[id]);
  }else if(action==='submit'){
   if(!['draft','withdrawn'].includes(r.review_state))fail('invalidState');requireNames(r);
   await db.query("UPDATE admin_destination SET review_state='review',version=version+1 WHERE entity_id=$1",[id]);
  }else{
   if(r.review_state!=='review')fail('invalidState');
   const approved=await reviews(db,r);
   if(action==='return')await db.query("UPDATE admin_destination SET review_state='draft',cycle=cycle+1,version=version+1 WHERE entity_id=$1",[id]);
   if(action==='subject'||action==='language'){
    if(action==='language'&&(!editorialLocales.includes(locale)||!approved.some(v=>v.kind==='subject')))fail('subjectRequired');
    await db.query('INSERT INTO destination_review(revision_id,cycle,actor_id,kind,locale,reason) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',[r.revision_id,r.cycle,p.userId,action,action==='subject'?'*':locale,reason]);
   }

  }
  await event(db,p,id,action,reason);return {id};
 });}
 return {read,save,generation,transition};
}
