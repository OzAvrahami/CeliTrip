import {destinations} from './destinations.js';
import {randomUUID} from 'node:crypto';
import {editorialService,editorialSession,authorize,transaction} from './editorial-service.js';
import {fail,text,editorialLocales,translationComplete,validateDocument,DomainError} from './editorial-validation.js';
import {operate} from '../../scripts/editorial-account.js';

const allRoles=['editor','language_reviewer','subject_reviewer','publisher','administrator'];
const clean=v=>typeof v==='string'?v.slice(0,120).trim():'';
function page(rows,q){const order=q.sort==='oldest'?1:-1,locale=editorialLocales.includes(q.uiLocale)?q.uiLocale:'en';const name=r=>r.titles?.[locale]||r.labels?.[locale]||(typeof r.title==='string'?r.title:r.title?.[locale])||r.name||'';rows.sort((a,b)=>q.sort==='name'?name(a).localeCompare(name(b),locale):order*(Number(a.order||0)-Number(b.order||0))||String(a.id).localeCompare(String(b.id)));const size=10,total=rows.length,pages=Math.max(1,Math.ceil(total/size)),current=Math.min(pages,Math.max(1,parseInt(q.page)||1));return {rows:rows.slice((current-1)*size,current*size),total,page:current,pages};}
const matches=(values,q)=>!clean(q)||JSON.stringify(values).toLocaleLowerCase().includes(clean(q).toLocaleLowerCase());
const labels=input=>Object.fromEntries(editorialLocales.map(l=>[l,text(input?.[l],160)]));
const audit=async(db,p,entity,action,reason)=>db.query('INSERT INTO editorial_audit(actor_id,entity_id,action,reason) VALUES($1,$2,$3,$4)',[p.userId,entity,action,text(reason,1000,5)]);
const snapshot=async(db,p,kind,target,version,value)=>db.query('INSERT INTO admin_history(kind,target,version,actor_id,snapshot) VALUES($1,$2,$3,$4,$5)',[kind,target,version,p.userId,value]);

/** Read models contain only authorized rows; aggregation and pagination happen after scope filtering. */
export function administration(pool){
 const editorial=editorialService(pool);
 async function context(p){const actor=await editorialSession(pool,p);const grants=(await pool.query('SELECT role,scope,locale FROM editorial_grant WHERE user_id=$1',[p.userId])).rows;if(!grants.length)fail('forbidden',403);return {...actor,grants,administrator:grants.some(g=>g.role==='administrator'&&g.scope==='rome')};}
 async function catalog(p){const c=await context(p);const destinations=(await pool.query(`SELECT d.*,e.parent_id,dr.identity,dp.revision_id AS published_revision,lp.revision_id AS legacy_publication,EXISTS(SELECT 1 FROM editorial_grant cg WHERE cg.user_id=$1 AND cg.role='editor' AND editorial_scope_contains(cg.scope,e.id)) AS "canCreate" FROM admin_destination d JOIN entity e ON e.id=d.entity_id LEFT JOIN destination_revision dr ON dr.id=d.revision_id LEFT JOIN destination_publication dp ON dp.entity_id=d.entity_id LEFT JOIN publication lp ON lp.entity_id=d.entity_id WHERE $2 OR EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=$1 AND (editorial_scope_contains(g.scope,e.id) OR editorial_scope_contains(e.id,g.scope))) ORDER BY d.labels->>'en'`,[p.userId,c.administrator])).rows;const categories=(await pool.query('SELECT * FROM admin_category ORDER BY labels->>\'en\'')).rows;const branches=(await pool.query("SELECT e.id,COALESCE(t.titles,'{}') AS titles FROM entity e LEFT JOIN LATERAL(SELECT jsonb_object_agg(tr.locale,tr.title) AS titles FROM translation_revision tr WHERE tr.revision_id=(SELECT id FROM content_revision WHERE entity_id=e.id ORDER BY revision_number DESC LIMIT 1))t ON true WHERE e.kind='branch' AND ($2 OR EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=$1 AND editorial_scope_contains(g.scope,e.id)))",[p.userId,c.administrator])).rows;return {destinations,categories,branches};}
 async function records(p){const list=await editorial.list(p);const result=[];for(const b of list.branches){const r=await editorial.read(p,b.id);
  const valid=(await pool.query(`SELECT r.id FROM editorial_review r JOIN content_revision cr ON cr.id=r.revision_id WHERE cr.entity_id=$1 AND NOT EXISTS(SELECT 1 FROM admin_access a WHERE a.user_id=r.actor_id AND a.disabled) AND EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=r.actor_id AND editorial_scope_contains(g.scope,$1) AND g.role=CASE r.kind WHEN 'subject' THEN 'subject_reviewer' ELSE 'language_reviewer' END AND g.locale=r.locale)`,[b.id])).rows.map(x=>x.id);
  const previous=(await pool.query('SELECT DISTINCT locale FROM editorial_review r JOIN content_revision c ON c.id=r.revision_id WHERE c.entity_id=$1 AND (r.revision_id<>$2 OR r.cycle<>$3)',[b.id,r.revision,r.cycle])).rows.map(x=>x.locale);
  const approved=r.reviews.filter(x=>x.cycle===r.cycle&&valid.includes(x.id));
  const states=Object.fromEntries(editorialLocales.map(l=>[l,!translationComplete(r.document,l)?'missing':approved.some(x=>x.locale===l)?'approved':previous.includes(l)?'outdated':r.state==='review'?'awaiting':'draft']));
  let evidenceIssue=null;try{validateDocument(r.document,r.entity,new Date(),{draft:true,categories:r.document.categories});}catch(e){if(!(e instanceof DomainError))throw e;evidenceIssue=e.code;}
  const subject=approved.some(x=>x.kind==='subject'),ready=r.state==='review'&&subject&&Object.values(states).every(x=>x==='approved')&&!evidenceIssue;
  const returned=r.events[0]?.action==='return';
  const permissions=(await pool.query('SELECT role,locale FROM editorial_grant WHERE user_id=$1 AND editorial_scope_contains(scope,$2)',[p.userId,b.id])).rows;
  result.push({...r,id:b.id,title:r.document.translations.en?.title||'',titles:Object.fromEntries(editorialLocales.map(l=>[l,r.document.translations[l]?.title||''])),states,subject,ready,returned,permissions,evidenceIssue,order:Number(r.events[0]?.id||0),state:r.published===r.revision?'published':r.state});
 }return result;}
 function filter(rows,q){return rows.filter(r=>matches([r.titles,r.document?.address],q.q)&&(!q.destination||r.entity.parent_id===q.destination)&&(!q.category||r.document.categories.includes(q.category))&&(!q.state||r.state===q.state)&&(!q.publication||(q.publication==='published'?!!r.published:!r.published))&&(!q.queue||(q.queue==='ready'?r.ready:q.queue==='subject'?r.state==='review'&&!r.subject:q.queue==='translations'?Object.entries(r.states).some(([l,s])=>s!=='approved'&&r.permissions.some(g=>g.role!=='language_reviewer'||g.locale===l)):q.queue==='returned'?r.returned:true))&&(!q.translation||(q.language?r.states[q.language]===q.translation:Object.values(r.states).includes(q.translation))));}
 async function corrections(p,q={}){const c=await context(p);if(!c.grants.some(g=>g.role==='editor'))fail('forbidden',403);
  let rows=(await pool.query(`SELECT c.*,u.name AS assignee,COALESCE(t.title,'') AS title FROM correction c LEFT JOIN "user" u ON u.id=c.assigned_to LEFT JOIN translation_revision t ON t.revision_id=c.revision_id AND t.locale='en' WHERE EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=$1 AND g.role='editor' AND editorial_scope_contains(g.scope,c.entity_id)) ORDER BY c.created_at DESC`,[p.userId])).rows;
  rows=rows.filter(r=>(!q.state||(q.state==='open'?r.state!=='resolved':r.state===q.state))&&matches([r.title,r.message],q.q)&&(!q.assigned||r.assigned_to===(q.assigned==='me'?p.userId:q.assigned)));
  const out=page(rows.map(r=>({...r,order:new Date(r.created_at).getTime()})),q);
  for(const r of out.rows){r.editors=(await pool.query(`SELECT DISTINCT u.id,u.name FROM "user" u JOIN editorial_grant g ON g.user_id=u.id WHERE g.role='editor' AND editorial_scope_contains(g.scope,$1) AND NOT EXISTS(SELECT 1 FROM admin_access a WHERE a.user_id=u.id AND a.disabled)`,[r.entity_id])).rows;r.history=(await pool.query('SELECT e.*,u.name AS actor FROM correction_event e JOIN "user" u ON u.id=e.actor_id WHERE correction_id=$1 ORDER BY e.id DESC',[r.id])).rows;}return out;
 }
 async function activity(p,q={}){const c=await context(p);let rows=(await pool.query(`SELECT a.*,COALESCE(u.name,a.operator) AS actor,COALESCE(t.title,d.labels->>'en') AS title FROM editorial_audit a LEFT JOIN "user" u ON u.id=a.actor_id LEFT JOIN admin_destination d ON d.entity_id=a.entity_id LEFT JOIN LATERAL(SELECT tr.title FROM content_revision cr JOIN translation_revision tr ON tr.revision_id=cr.id AND tr.locale='en' WHERE cr.entity_id=a.entity_id ORDER BY cr.revision_number DESC LIMIT 1)t ON true WHERE (a.entity_id IS NOT NULL AND EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=$1 AND editorial_scope_contains(g.scope,a.entity_id) AND (a.action NOT LIKE 'correction%' OR g.role='editor'))) OR ($2 AND (a.entity_id IS NULL OR a.action='destination')) ORDER BY a.id DESC`,[p.userId,c.administrator])).rows;
  rows=rows.filter(r=>matches([r.actor,r.title,r.reason],q.q)&&(!q.action||r.action.split(':')[0]===q.action));return page(rows.map(r=>({...r,order:Number(r.id)})),q);}
 return {
 context,catalog,records,activity,corrections,
 async read(p,view,q={}){await context(p);
  if(['dashboard','places','reviews','translations','sources'].includes(view)){
   const rs=await records(p),c=await context(p);
   if(view==='dashboard'){
    const allowedLocales=r=>new Set(r.permissions.some(g=>g.role!=='language_reviewer')?editorialLocales:r.permissions.map(g=>g.locale));
    const open=c.grants.some(g=>g.role==='editor')?(await corrections(p,{})).total:null;
    const openCount=open===null?null:(await pool.query(`SELECT count(*)::int AS n FROM correction c WHERE c.state<>'resolved' AND EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=$1 AND g.role='editor' AND editorial_scope_contains(g.scope,c.entity_id))`,[p.userId])).rows[0].n;
    return {counts:{drafts:rs.filter(r=>r.state==='draft').length,reviews:rs.filter(r=>r.state==='review').length,translations:rs.reduce((n,r)=>n+[...allowedLocales(r)].filter(l=>r.states[l]!=='approved').length,0),corrections:openCount,published:rs.filter(r=>r.published).length},work:rs.filter(r=>r.state!=='published').slice(0,6),activity:(await activity(p,{})).rows.slice(0,6)};
   }
   if(view==='sources'){
    const ids=rs.map(r=>r.id);let rows=(await pool.query(`SELECT s.id,s.source_id,s.revision_number,s.source_type,s.subject_id,s.title,s.url,s.published_on,o.stance,o.statement,o.observed_on,o.effective_on,o.expires_on,c.dimensions,c.predicate,c.copy,c.id AS claim_id,c.revision_id,cr.entity_id,cr.revision_number AS content_number,er.created_at FROM source_revision s JOIN observation o ON o.source_revision_id=s.id JOIN claim_revision c ON c.id=o.claim_id JOIN content_revision cr ON cr.id=c.revision_id LEFT JOIN editorial_revision er ON er.id=cr.id WHERE cr.entity_id=ANY($1::text[]) ORDER BY cr.revision_number DESC,s.revision_number DESC`,[ids])).rows;
    rows=rows.map(r=>({...r,id:r.id+':'+r.claim_id,order:r.created_at?new Date(r.created_at).getTime():0,branch:rs.find(b=>b.id===r.entity_id).titles,current:rs.find(b=>b.id===r.entity_id).revision===r.revision_id})).filter(r=>(q.history==='all'||r.current)&&matches([r.title,r.statement,r.branch,r.predicate],q.q)&&(!q.dimension||r.dimensions.includes(q.dimension))&&(!q.type||r.source_type===q.type));return page(rows,q);
   }
   let filtered=filter(rs,q);
   if(view==='reviews'&&!q.queue)filtered=filtered.filter(r=>r.state==='review'||r.returned);
   if(view==='translations'&&q.language)filtered=filtered.filter(r=>r.permissions.some(g=>g.role!=='language_reviewer'||g.locale===q.language));
   return page(filtered,q);
  }
  if(view==='corrections')return corrections(p,q);
  if(view==='activity')return activity(p,q);
  if(view==='destinations'||view==='categories'){const cat=await catalog(p);return page((view==='destinations'?cat.destinations.map(d=>({...d,id:d.entity_id,publicationState:d.state==='archived'?'archived':d.published_revision||d.legacy_publication?(d.published_revision===d.revision_id?'published':'publishedDraft'):d.review_state,order:new Date(d.updated_at).getTime()})):cat.categories.map(c=>({...c,order:new Date(c.updated_at).getTime()}))).filter(r=>matches(r.labels,q.q)&&(!q.kind||r.kind===q.kind)&&(!q.state||(r.publicationState||r.state||(r.archived?'archived':'draft'))===q.state)&&(!q.destination||r.parent_id===q.destination)),q);}
  await authorize(pool,p,['administrator']);
  if(view==='team'){const rows=(await pool.query(`SELECT u.id,u.name,u.email,u."createdAt" AS created_at,u."twoFactorEnabled" AS enrolled,COALESCE(a.disabled,false) AS disabled,COALESCE(a.version,1) AS version,(SELECT count(*)::int FROM session s WHERE s."userId"=u.id AND s."expiresAt">now()) AS sessions,COALESCE((SELECT jsonb_agg(jsonb_build_object('role',g.role,'scope',g.scope,'locale',g.locale)) FROM editorial_grant g WHERE g.user_id=u.id),'[]') AS grants FROM "user" u LEFT JOIN admin_access a ON a.user_id=u.id ORDER BY u.name`)).rows;return page(rows.map(r=>({...r,order:new Date(r.created_at).getTime()})).filter(r=>matches([r.name,r.email],q.q)&&(!q.state||(q.state==='disabled')===r.disabled)),q);}
  if(view==='settings')return (await pool.query("SELECT * FROM admin_setting WHERE key='identity'")).rows[0];
  fail('notFound',404);
 },
 async saveCatalog(p,kind,input){if(kind==='destination')return destinations(pool).save(p,input);return transaction(pool,async db=>{
  await authorize(db,p,['administrator']);const name=labels(input.labels);const creating=!input.id;
  const id=input.id||'category-'+randomUUID(),old=(await db.query('SELECT * FROM admin_category WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!creating&&(!old||old.version!==input.version))fail('conflict',409);
  if(input.archived&&(await db.query('SELECT 1 FROM content_revision WHERE $1=ANY(categories)',[id])).rowCount)fail('referencesInUse');
  const r=(await db.query('INSERT INTO admin_category(id,labels,archived) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET labels=$2,archived=$3,version=admin_category.version+1,updated_at=now() RETURNING *',[id,name,!!input.archived])).rows[0];await snapshot(db,p,kind,id,r.version,r);await audit(db,p,null,'category',input.reason);return {id};
 });},
 async settings(p,input){return transaction(pool,async db=>{await authorize(db,p,['administrator']);const old=(await db.query("SELECT * FROM admin_setting WHERE key='identity' FOR UPDATE")).rows[0];if(input.version!==old.version)fail('conflict',409);const translations=Object.fromEntries(editorialLocales.map(l=>[l,{name:text(input.translations?.[l]?.name,60),tagline:text(input.translations?.[l]?.tagline,140)}]));await db.query("UPDATE admin_setting SET translations=$1,version=version+1 WHERE key='identity'",[translations]);await snapshot(db,p,'settings','identity',old.version+1,translations);await audit(db,p,null,'settings',input.reason);return {ok:true};});},
 async correction(p,input){return transaction(pool,async db=>{const row=(await db.query('SELECT * FROM correction WHERE id=$1 FOR UPDATE',[input.id])).rows[0];if(!row)fail('notFound',404);await authorize(db,p,['editor'],row.entity_id);if(row.version!==input.version)fail('conflict',409);if(!['new','triaged','resolved'].includes(input.state))fail('invalid');const assigned=input.assigned||null;
  if(assigned&&!(await db.query("SELECT 1 FROM editorial_grant g WHERE user_id=$1 AND role='editor' AND editorial_scope_contains(scope,$2) AND NOT EXISTS(SELECT 1 FROM admin_access a WHERE a.user_id=g.user_id AND a.disabled)",[assigned,row.entity_id])).rowCount)fail('invalidAssignee');
  const reason=text(input.reason,1000,5);await db.query('UPDATE correction SET state=$2,assigned_to=$3,version=version+1 WHERE id=$1',[row.id,input.state,assigned]);await db.query('INSERT INTO correction_event(correction_id,actor_id,state,assigned_to,note) VALUES($1,$2,$3,$4,$5)',[row.id,p.userId,input.state,assigned,reason]);await audit(db,p,row.entity_id,'correction',reason);return {ok:true};});},
 async team(p,input){await authorize(pool,p,['administrator']);if(!['create','grant','disable','enable','revoke'].includes(input.operation))fail('invalid');return operate(pool,input.operation,{...input,operator:'Authenticated local administrator'},p);}
 };
}
