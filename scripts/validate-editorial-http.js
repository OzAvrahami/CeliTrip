// Explicit opt-in HTTP integration check against the disposable editorial test preview only.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import pg from 'pg';
import {symmetricDecrypt} from 'better-auth/crypto';
import {operate} from './editorial-account.js';
import {createAuth} from '../src/server/auth-config.js';
import {localConfig} from '../src/server/local-config.js';
if(new URL(process.env.DATABASE_URL).pathname!=='/celitrip_editorial_test')throw Error('HTTP tests require the disposable editorial test database and matching running preview.');
const pool=new pg.Pool(localConfig()),auth=createAuth(pool),jar={};
const email=`http-${randomBytes(6).toString('hex')}@demo.invalid`,password=randomBytes(24).toString('base64url');
const account={email,password,name:'HTTP authorization test',operator:'Isolated HTTP validation',reason:'Synthetic direct-request authorization tests',grants:[{role:'language_reviewer',scope:'forno-demo',locale:'fr'}]};
async function call(path,body,authenticated=true,origin='http://127.0.0.1:3000'){
 const r=await fetch('http://127.0.0.1:3000'+path,{method:body?'POST':'GET',redirect:'manual',headers:{origin,'Content-Type':'application/json',...(authenticated?{cookie:Object.entries(jar).map(([k,v])=>k+'='+v).join('; ')}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(authenticated)for(const c of r.headers.getSetCookie()){const at=c.indexOf('=');jar[c.slice(0,at)]=c.slice(at+1).split(';')[0];}
 const data=await r.json().catch(()=>null);return {status:r.status,data};
}
try{
 const user=await operate(pool,'create',account);
 assert.equal((await call('/api/auth/sign-up/email',{email,password,name:'No signup'},false)).status,403);
 assert.equal((await call('/api/editorial',null,false)).status,401);
 assert.equal((await call('/api/auth/sign-in/email',{email,password},true,'https://evil.invalid')).status,403);
 assert.equal((await call('/api/auth/sign-in/email',{email,password})).status,200);
 assert.equal((await call('/api/editorial')).status,401);
 assert.equal((await call('/api/auth/two-factor/enable',{password,method:'totp'})).status,200);
 const row=(await pool.query('SELECT secret FROM "twoFactor" WHERE "userId"=$1',[user.id])).rows[0];
 const secret=await symmetricDecrypt({key:process.env.BETTER_AUTH_SECRET,data:row.secret});
 assert.equal((await call('/api/auth/two-factor/verify-totp',{code:(await auth.api.generateTOTP({body:{secret}})).code})).status,200);
 assert.equal((await call('/api/editorial')).data.branches.length,1);
 assert.equal((await call('/api/editorial?id=tavola-demo')).status,403);
 assert.equal((await call('/api/editorial?view=corrections')).status,403);
 assert.equal((await call('/api/editorial?view=access')).status,403);
 for(const action of ['save','publish','withdraw','subject'])assert.equal((await call('/api/editorial',{action,id:'forno-demo',expected:'forno-v2',revision:'forno-v2',cycle:0,reason:'Attempt outside assigned role',document:{}})).status,403);
 assert.equal((await call('/api/editorial',{action:'language',id:'forno-demo',revision:'forno-v2',cycle:0,locale:'ru',reason:'Wrong locale attempt'})).status,403);
 assert.equal((await call('/api/auth/two-factor/disable',{password})).status,403);
 await operate(pool,'revoke',account);assert.equal((await call('/api/editorial')).status,401);
 await pool.query("DELETE FROM submission_limit WHERE bucket='local-corrections'");
 const correction=await call('/api/corrections',{entity:'forno-demo',revision:'forno-v1',claim:'fryer',message:'Synthetic anonymous HTTP correction',contact:'private-http@demo.invalid'},false);
 assert.equal(correction.status,200);assert.deepEqual(Object.keys(correction.data),['receipt']);
 assert.equal((await pool.query('SELECT contact FROM correction WHERE id=$1',[correction.data.receipt])).rows[0].contact,'private-http@demo.invalid');
 assert.equal((await pool.query("SELECT revision_id FROM publication WHERE entity_id='forno-demo'")).rows[0].revision_id,'forno-v1');
 console.log('HTTP validation passed: signup/origin/MFA, scope/locale/role denials, revocation, anonymous correction persistence and privacy (22 assertions).');
}finally{await pool.end();}
