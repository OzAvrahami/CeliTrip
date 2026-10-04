import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {localConfig} from '../src/server/local-config.js';
import {transaction,authorize} from '../src/server/editorial-service.js';
import {text,fail} from '../src/server/editorial-validation.js';
/** Operator-only: input arrives on stdin, never in command-line arguments or logs. */
export async function operate(pool,action,input,principal=null){
  localConfig();
  if(!['create','recover','revoke','grant','disable','enable'].includes(action))fail('invalid');
  const email=text(input.email,254).toLowerCase();if(!/^[a-z0-9.+_-]+@demo\.invalid$/.test(email))fail('fictionalOnly');
  const operator=text(input.operator,100,3),reason=text(input.reason,1000,5);
  const password=action==='create'||action==='recover'?text(input.password,128,14):null;
  const hash=password?await hashPassword(password):null;
  return transaction(pool,async db=>{
    await db.query("SELECT pg_advisory_xact_lock(hashtext('celitrip-team-management'))");
    if(principal)await authorize(db,principal,['administrator']);
    let user=(await db.query('SELECT id FROM "user" WHERE email=$1 FOR UPDATE',[email])).rows[0];
    if(principal&&user){
      if(user.id===principal.userId&&['grant','disable','recover'].includes(action))fail('selfChange',403);
      const version=(await db.query('SELECT version FROM admin_access WHERE user_id=$1',[user.id])).rows[0]?.version||1;
      if(input.version!==version)fail('conflict',409);
    }
    if(action==='create'||action==='grant'){
      if(!Array.isArray(input.grants)||!input.grants.length||input.grants.length>20)fail('invalid');
      if(new Set(input.grants.map(g=>[g.role,g.scope,g.locale].join(':'))).size!==input.grants.length)fail('invalid');
      for(const g of input.grants){
        if(!['editor','subject_reviewer','language_reviewer','publisher','administrator'].includes(g.role)||!['*','he','en','fr','ru'].includes(g.locale)||g.role==='language_reviewer'&&g.locale==='*'||g.role!=='language_reviewer'&&g.locale!=='*'||g.role==='administrator'&&g.scope!=='rome')fail('invalid');
        if(!(await db.query('SELECT 1 FROM entity WHERE id=$1',[g.scope])).rowCount)fail('invalid');
      }
    }
    if(user&&['grant','disable'].includes(action)){
      const isAdmin=(await db.query("SELECT 1 FROM editorial_grant g WHERE user_id=$1 AND role='administrator' AND scope='rome' AND NOT EXISTS(SELECT 1 FROM admin_access a WHERE a.user_id=g.user_id AND a.disabled)",[user.id])).rowCount;
      const retains=action==='grant'&&input.grants.some(g=>g.role==='administrator'&&g.scope==='rome');
      if(isAdmin&&!retains&&!(await db.query("SELECT 1 FROM editorial_grant g WHERE role='administrator' AND scope='rome' AND user_id<>$1 AND NOT EXISTS(SELECT 1 FROM admin_access a WHERE a.user_id=g.user_id AND a.disabled)",[user.id])).rowCount)fail('lastAdministrator',409);
    }
    if(action==='create'){
      if(user)fail('conflict',409);user={id:randomUUID()};
      await db.query('INSERT INTO "user"(id,name,email,"emailVerified","createdAt","updatedAt","twoFactorEnabled") VALUES($1,$2,$3,true,now(),now(),false)',[user.id,'Local demo · '+text(input.name,80),email]);
      await db.query('INSERT INTO account(id,"accountId","providerId","userId",password,"createdAt","updatedAt") VALUES($1,$2,\'credential\',$2,$3,now(),now())',[randomUUID(),user.id,hash]);
    }else if(!user)fail('notFound',404);
    if(action==='recover'){
      await db.query('UPDATE account SET password=$2,"updatedAt"=now() WHERE "userId"=$1 AND "providerId"=\'credential\'',[user.id,hash]);
      await db.query('DELETE FROM "twoFactor" WHERE "userId"=$1',[user.id]);
      await db.query('UPDATE "user" SET "twoFactorEnabled"=false,"updatedAt"=now() WHERE id=$1',[user.id]);
      // Invalidates pending second-factor challenges and trusted-device verifications for this identity.
      await db.query('DELETE FROM verification WHERE value=$1',[user.id]);
    }
    if(action==='create'||action==='grant'){
      if(!Array.isArray(input.grants)||!input.grants.length||input.grants.length>20)fail('invalid');
      await db.query('DELETE FROM editorial_grant WHERE user_id=$1',[user.id]);
      for(const g of input.grants)await db.query('INSERT INTO editorial_grant(user_id,role,scope,locale) VALUES($1,$2,$3,$4)',[user.id,g.role,g.scope||'rome',g.locale||'*']);
    }
    await db.query('INSERT INTO admin_access(user_id,disabled) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET version=admin_access.version+1,disabled=CASE WHEN $3 IN(\'disable\',\'enable\') THEN $2 ELSE admin_access.disabled END',[user.id,action==='disable',action]);
    if(principal)await db.query("INSERT INTO admin_history(kind,target,version,actor_id,snapshot) SELECT 'account',u.id,a.version,$2,jsonb_build_object('disabled',a.disabled,'grants',(SELECT jsonb_agg(jsonb_build_object('role',g.role,'scope',g.scope,'locale',g.locale)) FROM editorial_grant g WHERE g.user_id=u.id)) FROM \"user\" u JOIN admin_access a ON a.user_id=u.id WHERE u.id=$1",[user.id,principal.userId]);
    await db.query('DELETE FROM session WHERE "userId"=$1',[user.id]);
    await db.query('INSERT INTO editorial_audit(actor_id,operator,action,reason) VALUES($1,$2,$3,$4)',[principal?.userId||null,operator,action+':'+user.id,reason]);return {id:user.id};
  });
}
if(process.argv[1]?.endsWith('editorial-account.js')){
  const pool=new pg.Pool(localConfig());try{let raw='';for await(const part of process.stdin){raw+=part;if(raw.length>12000)throw Error('Input too large');}await operate(pool,process.argv[2],JSON.parse(raw));console.log('Operator action completed; sessions revoked. TOTP enrollment is mandatory.');}
  catch(error){console.error('Operator action failed:',error.code||'invalid input');process.exitCode=1;}finally{await pool.end();}
}
