import {randomUUID} from 'node:crypto';
import {transaction} from './editorial-service.js';
import {fail,text} from './editorial-validation.js';
/** Local loopback shares one persisted throttle bucket; caller headers cannot evade it. */
export async function submitCorrection(pool,input){
  if(input.website)fail('invalid');
  const message=text(input.message,2000,10),contact=input.contact?text(input.contact,254):null;
  if(contact&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))fail('invalid');
  // Throttle is committed independently of invalid branch references.
  const limit=await pool.query(`INSERT INTO submission_limit(bucket,count,expires_at) VALUES('local-corrections',1,now()+interval '10 minutes') ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN submission_limit.expires_at<now() THEN 1 ELSE LEAST(submission_limit.count+1,9) END,expires_at=CASE WHEN submission_limit.expires_at<now() THEN now()+interval '10 minutes' ELSE submission_limit.expires_at END RETURNING count`);
  if(limit.rows[0].count>8)fail('rateLimited',429);
  return transaction(pool,async db=>{
    const p=(await db.query("SELECT p.revision_id FROM publication p JOIN entity e ON e.id=p.entity_id WHERE p.entity_id=$1 AND e.kind='branch' FOR SHARE OF p",[text(input.entity,100)])).rows[0];
    if(!p||p.revision_id!==input.revision)fail('conflict',409);
    const claim=input.claim||null;
    if(claim&&!(await db.query('SELECT 1 FROM claim_revision WHERE revision_id=$1 AND id=$2',[p.revision_id,text(claim,100)])).rowCount)fail('wrongScope');
    const id=randomUUID();await db.query('INSERT INTO correction(id,entity_id,revision_id,claim_id,message,contact) VALUES($1,$2,$3,$4,$5,$6)',[id,input.entity,p.revision_id,claim,message,contact]);return {receipt:id};
  });
}
