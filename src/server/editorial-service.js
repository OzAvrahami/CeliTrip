import {randomUUID} from 'node:crypto';
import {DomainError,fail,text,validateDocument,editorialLocales,translationComplete} from './editorial-validation.js';
import {localDemoAccount} from './local-demo-auth.js';

export async function transaction(pool,work){const db=await pool.connect();try{await db.query('BEGIN');const result=await work(db);await db.query('COMMIT');return result;}catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}}
/** A principal is derived from Better Auth, but every service rechecks its DB session and grants. */
export async function editorialSession(db,principal){
  if(!principal?.sessionId)fail('signInRequired',401);
  const {rows}=await db.query(`SELECT s."userId" AS id,u.name,u.email,u."twoFactorEnabled",s."mfaVerified",s."localDemoPassword" FROM session s JOIN "user" u ON u.id=s."userId"
    WHERE s.id=$1 AND s."userId"=$2 AND s."expiresAt">now() AND NOT EXISTS(SELECT 1 FROM admin_access a WHERE a.user_id=u.id AND a.disabled)`,[principal.sessionId,principal.userId]);
  const row=rows[0];
  if(!row || !(row.mfaVerified && row.twoFactorEnabled) &&
    !(row.localDemoPassword && localDemoAccount(row.email,principal.requestHeaders)))fail('mfaRequired',401);
  return {id:row.id,name:row.name};
}
export async function authorize(db,principal,roles,entity='rome',locale='*'){
  const actor=await editorialSession(db,principal);
  const grants=await db.query(`SELECT role,scope,locale FROM editorial_grant WHERE user_id=$1 AND role=ANY($2::text[]) AND editorial_scope_contains(scope,$3) AND ($4='*' OR locale=$4 OR (role<>'language_reviewer' AND locale='*'))`,[principal.userId,roles,entity,locale]);
  if(!grants.rowCount)fail('forbidden',403);return actor;
}
const allRoles=['editor','language_reviewer','subject_reviewer','publisher','administrator'];
async function audit(db,p,entity,revision,action,reason){await db.query('INSERT INTO editorial_audit(actor_id,entity_id,revision_id,action,reason) VALUES($1,$2,$3,$4,$5)',[p.userId,entity,revision,action,reason]);}
async function entityFor(db,id){const e=(await db.query("SELECT * FROM entity WHERE id=$1 AND kind='branch'",[id])).rows[0];if(!e)fail('notFound',404);return e;}
async function baseDocument(db,revision){
  const r=(await db.query('SELECT * FROM content_revision WHERE id=$1',[revision])).rows[0];
  const tr=(await db.query('SELECT * FROM translation_revision WHERE revision_id=$1',[revision])).rows;
  const cs=(await db.query('SELECT * FROM claim_revision WHERE revision_id=$1 ORDER BY id',[revision])).rows;
  const claims=[];for(const c of cs){const observations=(await db.query(`SELECT o.*,s.source_id,s.subject_id,s.source_type,s.title,s.url,s.published_on FROM observation o JOIN source_revision s ON s.id=o.source_revision_id WHERE o.claim_id=$1 ORDER BY s.source_id,s.revision_number`,[c.id])).rows.map(o=>({sourceKey:o.source_id,subject:o.subject_id,type:o.source_type,title:o.title,url:o.url,publishedOn:iso(o.published_on),observedOn:iso(o.observed_on),effectiveOn:iso(o.effective_on),expiresOn:iso(o.expires_on),verifiedOn:iso(o.verified_on),verificationMethod:o.verification_method,stance:o.stance,statement:o.statement}));claims.push({key:c.id,subject:c.subject_id,predicate:c.predicate,value:c.value,dimensions:c.dimensions,copy:c.copy,observations});}
  return {fictional:true,categories:r.categories,address:r.address,translations:Object.fromEntries(tr.map(t=>[t.locale,{title:t.title,summary:t.summary}])),claims};
}
const iso=v=>v instanceof Date?v.toISOString().slice(0,10):v;
export function editorialService(pool){return {
  async list(p){
    // Branch-specific grants must not reveal other branch identities or drafts.
    await editorialSession(pool,p);
    const grants=(await pool.query('SELECT role,scope,locale FROM editorial_grant WHERE user_id=$1',[p.userId])).rows;if(!grants.length)fail('forbidden',403);
    const rows=(await pool.query(`SELECT e.id,h.state,h.revision_id,p.revision_id AS published_revision,t.title,t.titles FROM entity e
      LEFT JOIN editorial_head h ON h.entity_id=e.id LEFT JOIN publication p ON p.entity_id=e.id
      LEFT JOIN LATERAL(SELECT max(title) FILTER(WHERE locale='en') AS title,jsonb_object_agg(locale,title) AS titles FROM translation_revision WHERE revision_id=COALESCE(h.revision_id,p.revision_id))t ON true
      WHERE e.kind='branch' AND EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=$1 AND editorial_scope_contains(g.scope,e.id)) ORDER BY e.id`,[p.userId])).rows;
    return {branches:rows,grants};
  },
  async read(p,id){await authorize(pool,p,allRoles,id);const entity=await entityFor(pool,id);
    const head=(await pool.query('SELECT * FROM editorial_head WHERE entity_id=$1',[id])).rows[0];
    const latest=(await pool.query('SELECT id FROM content_revision WHERE entity_id=$1 ORDER BY revision_number DESC LIMIT 1',[id])).rows[0];if(!latest)fail('notFound',404);
    const revision=head?.revision_id||latest.id;
    const saved=(await pool.query('SELECT document,parent_revision FROM editorial_revision WHERE id=$1',[revision])).rows[0];
    const published=(await pool.query('SELECT revision_id FROM publication WHERE entity_id=$1',[id])).rows[0]?.revision_id;
    const history=(await pool.query('SELECT r.id,r.revision_number,e.created_at,e.document,u.name AS actor FROM content_revision r LEFT JOIN editorial_revision e ON e.id=r.id LEFT JOIN "user" u ON u.id=e.actor_id WHERE r.entity_id=$1 ORDER BY r.revision_number DESC',[id])).rows;
    const reviews=(await pool.query('SELECT r.*,u.name AS actor FROM editorial_review r JOIN "user" u ON u.id=r.actor_id WHERE r.revision_id=$1 ORDER BY r.id',[revision])).rows;
    const events=(await pool.query('SELECT a.*,u.name AS actor FROM editorial_audit a LEFT JOIN "user" u ON u.id=a.actor_id WHERE a.entity_id=$1 ORDER BY a.id DESC',[id])).rows;
    const parent=saved?.parent_revision;
    const previous=parent?((await pool.query('SELECT document FROM editorial_revision WHERE id=$1',[parent])).rows[0]?.document||await baseDocument(pool,parent)):null;
    return {entity,revision,managed:!!head,state:head?.state||(events[0]?.action==='withdraw'?'withdrawn':'draft'),cycle:head?.cycle||0,document:saved?.document||await baseDocument(pool,revision),previous,published,history,reviews,events};
  },
  async save(p,id,expected,input,translationLocale=null){return transaction(pool,async db=>{
    if(translationLocale){if(!id||!editorialLocales.includes(translationLocale))fail('invalid');await authorize(db,p,['editor','language_reviewer'],id,translationLocale);}
    else await authorize(db,p,['editor'],id||input.destination||'rome');
    let entity;
    if(!id){
      if(input.chain_id&&!(await db.query("SELECT 1 FROM entity WHERE id=$1 AND kind='chain' AND fixture=true",[input.chain_id])).rowCount)fail('wrongScope');
      const destination=input.destination||'rome';
      if(!(await db.query("SELECT 1 FROM admin_destination WHERE entity_id=$1 AND kind='city' AND state='draft'",[destination])).rowCount)fail('invalid');
      id='demo-'+randomUUID();await db.query("INSERT INTO entity(id,kind,parent_id,chain_id) VALUES($1,'branch',$2,$3)",[id,destination,input.chain_id||null]);entity=await entityFor(db,id);
    }
    else {await db.query('SELECT id FROM entity WHERE id=$1 FOR UPDATE',[id]);entity=await entityFor(db,id);}
    const latest=(await db.query('SELECT id,revision_number FROM content_revision WHERE entity_id=$1 ORDER BY revision_number DESC LIMIT 1',[id])).rows[0];
    if((latest?.id||null)!==(expected||null))fail('conflict',409);
    if(translationLocale){
      const original=(await db.query('SELECT document FROM editorial_revision WHERE id=$1',[latest.id])).rows[0]?.document||await baseDocument(db,latest.id);
      const next=structuredClone(original),l=translationLocale;next.translations[l]=input.translations?.[l];
      next.claims.forEach((c,i)=>{c.copy[l]=input.claims?.[i]?.copy?.[l];c.observations.forEach((o,j)=>{o.title[l]=input.claims?.[i]?.observations?.[j]?.title?.[l];o.statement[l]=input.claims?.[i]?.observations?.[j]?.statement?.[l];});});input=next;
    }
    if(!latest){input=structuredClone(input);for(const c of input.claims||[]){if(c.subject==='new')c.subject=id;for(const o of c.observations||[])if(o.subject==='new')o.subject=id;}}
    const allowedCategories=(await db.query('SELECT id FROM admin_category WHERE NOT archived OR id=ANY($1::text[])',[latest?(await db.query('SELECT categories FROM content_revision WHERE id=$1',[latest.id])).rows[0].categories:[]])).rows.map(c=>c.id);
    const doc=validateDocument(input,entity,new Date(),{draft:true,categories:allowedCategories}),revision=randomUUID(),number=(latest?.revision_number||0)+1;
    await db.query("INSERT INTO content_revision(id,entity_id,revision_number,status,categories,address) VALUES($1,$2,$3,'draft',$4,$5)",[revision,id,number,doc.categories,doc.address]);
    for(const l of editorialLocales)await db.query('INSERT INTO translation_revision(revision_id,locale,title,summary) VALUES($1,$2,$3,$4)',[revision,l,doc.translations[l].title,doc.translations[l].summary]);
    for(const c of doc.claims){const claimId=randomUUID();c.revisionId=claimId;await db.query('INSERT INTO claim_revision(id,revision_id,subject_id,predicate,value,dimensions,copy) VALUES($1,$2,$3,$4,$5,$6,$7)',[claimId,revision,c.subject,c.predicate,c.value,c.dimensions,c.copy]);
      for(const o of c.observations){const sourceKey=id+':'+o.sourceKey,sourceId=randomUUID();const n=+(await db.query('SELECT COALESCE(max(revision_number),0)+1 AS n FROM source_revision WHERE source_id=$1',[sourceKey])).rows[0].n;
        o.sourceRevision=n;o.sourceRevisionId=sourceId;
        await db.query('INSERT INTO source_revision(id,source_id,revision_number,subject_id,source_type,title,url,published_on) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[sourceId,sourceKey,n,o.subject,o.type,o.title,o.url,o.publishedOn]);
        await db.query('INSERT INTO observation(id,claim_id,source_revision_id,stance,statement,observed_on,effective_on,expires_on) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),claimId,sourceId,o.stance,o.statement,o.observedOn,o.effectiveOn,o.expiresOn]);
      }
    }
    await db.query('INSERT INTO editorial_revision(id,parent_revision,actor_id,document) VALUES($1,$2,$3,$4)',[revision,latest?.id||null,p.userId,doc]);
    await db.query("INSERT INTO editorial_head(entity_id,revision_id,state) VALUES($1,$2,'draft') ON CONFLICT(entity_id) DO UPDATE SET revision_id=$2,state='draft',cycle=0",[id,revision]);
    await audit(db,p,id,revision,'save','New immutable revision; dependent approvals require new review.');return {id,revision};
  });},
  async transition(p,id,revision,cycle,action,locale,reason){return transaction(pool,async db=>{
    const role={submit:'editor',subject:'subject_reviewer',language:'language_reviewer',publish:'publisher',withdraw:'publisher',return:'subject_reviewer'}[action];if(!role)fail('invalid');
    await authorize(db,p,action==='return'?['subject_reviewer','language_reviewer','publisher']:[role],id,action==='language'?locale:'*');
    await db.query('SELECT id FROM entity WHERE id=$1 FOR UPDATE',[id]);const entity=await entityFor(db,id);
    const head=(await db.query('SELECT * FROM editorial_head WHERE entity_id=$1 FOR UPDATE',[id])).rows[0];
    if(!head&&action==='withdraw'){
      const latest=(await db.query('SELECT id FROM content_revision WHERE entity_id=$1 ORDER BY revision_number DESC LIMIT 1',[id])).rows[0];if(latest?.id!==revision||cycle!==0)fail('conflict',409);
      const old=(await db.query('DELETE FROM publication WHERE entity_id=$1 RETURNING revision_id',[id])).rows[0];if(!old)fail('notPublished');await audit(db,p,id,old.revision_id,'withdraw',text(reason,1000,5));return {id};
    }
    if(!head||head.revision_id!==revision||head.cycle!==cycle)fail('conflict',409);
    reason=text(reason,1000,5);
    if(action==='withdraw'){
      const old=(await db.query('DELETE FROM publication WHERE entity_id=$1 RETURNING revision_id',[id])).rows[0];if(!old)fail('notPublished');
      await db.query("UPDATE editorial_head SET state='withdrawn',cycle=cycle+1 WHERE entity_id=$1",[id]);await audit(db,p,id,old.revision_id,'withdraw',reason);return {id};
    }
    if(action==='submit') {if(!['draft','withdrawn'].includes(head.state))fail('invalidState');await db.query("UPDATE editorial_head SET state='review' WHERE entity_id=$1",[id]);}
    else {
      if(head.state!=='review')fail('invalidState');
      if(action==='return')await db.query("UPDATE editorial_head SET state='draft',cycle=cycle+1 WHERE entity_id=$1",[id]);
      if(action==='subject'||action==='language'){
        if(action==='language'&&!editorialLocales.includes(locale))fail('invalid');
        if(action==='language'){
          const doc=(await db.query('SELECT document FROM editorial_revision WHERE id=$1',[revision])).rows[0].document;
          if(!translationComplete(doc,locale))fail('missingTranslation');
        }
        if(action==='language'&&!(await db.query("SELECT 1 FROM editorial_review WHERE revision_id=$1 AND cycle=$2 AND kind='subject'",[revision,cycle])).rowCount)fail('subjectRequired');
        await db.query('INSERT INTO editorial_review(revision_id,cycle,actor_id,kind,locale,reason) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',[revision,cycle,p.userId,action,action==='subject'?'*':locale,reason]);
      }
      if(action==='publish'){
        const doc=(await db.query('SELECT document FROM editorial_revision WHERE id=$1',[revision])).rows[0].document;
        validateDocument(doc,entity,new Date(),{categories:(await db.query('SELECT id FROM admin_category')).rows.map(c=>c.id)});
        const reviews=(await db.query(`SELECT r.kind,r.locale FROM editorial_review r WHERE r.revision_id=$1 AND r.cycle=$2 AND NOT EXISTS(SELECT 1 FROM admin_access a WHERE a.user_id=r.actor_id AND a.disabled) AND EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=r.actor_id AND g.role=CASE r.kind WHEN 'subject' THEN 'subject_reviewer' ELSE 'language_reviewer' END AND editorial_scope_contains(g.scope,$3) AND g.locale=r.locale)`,[revision,cycle,id])).rows;
        if(reviews.length!==5)fail('reviewsRequired');
        await db.query('INSERT INTO publication(entity_id,revision_id) VALUES($1,$2) ON CONFLICT(entity_id) DO UPDATE SET revision_id=$2',[id,revision]);
        await db.query("UPDATE editorial_head SET state='published' WHERE entity_id=$1",[id]);
      }
    }
    await audit(db,p,id,revision,action,reason);return {id};
  });},
  async corrections(p){const grant=(await pool.query("SELECT scope FROM editorial_grant WHERE user_id=$1 AND role='editor' LIMIT 1",[p?.userId])).rows[0];await authorize(pool,p,['editor'],grant?.scope||'rome');return (await pool.query(`SELECT c.* FROM correction c WHERE EXISTS(SELECT 1 FROM editorial_grant g WHERE g.user_id=$1 AND g.role='editor' AND editorial_scope_contains(g.scope,c.entity_id)) ORDER BY created_at DESC LIMIT 100`,[p.userId])).rows;},
  async resolve(p,id,version,state,reason){return transaction(pool,async db=>{
    const grant=(await db.query("SELECT scope FROM editorial_grant WHERE user_id=$1 AND role='editor' LIMIT 1",[p?.userId])).rows[0];
    await authorize(db,p,['editor'],grant?.scope||'rome');
    const c=(await db.query('SELECT * FROM correction WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!c)fail('notFound',404);
    await authorize(db,p,['editor'],c.entity_id);if(c.version!==version)fail('conflict',409);if(!['triaged','resolved'].includes(state))fail('invalid');
    await db.query('UPDATE correction SET state=$2,version=version+1 WHERE id=$1',[id,state]);await audit(db,p,c.entity_id,c.revision_id,'correction:'+id+':'+state,text(reason,1000,5));return {id};
  });},
  async access(p){await authorize(pool,p,['administrator']);return (await pool.query('SELECT u.id,u.name,u.email,COALESCE(jsonb_agg(jsonb_build_object(\'role\',g.role,\'scope\',g.scope,\'locale\',g.locale)) FILTER(WHERE g.role IS NOT NULL),\'[]\') AS grants FROM "user" u LEFT JOIN editorial_grant g ON g.user_id=u.id GROUP BY u.id ORDER BY u.name')).rows;},
  async revoke(p,userId,reason){return transaction(pool,async db=>{await authorize(db,p,['administrator']);await db.query('DELETE FROM session WHERE "userId"=$1',[userId]);await audit(db,p,null,null,'revoke:'+text(userId,100),text(reason,1000,5));return {ok:true};});}
};}
export {DomainError};
