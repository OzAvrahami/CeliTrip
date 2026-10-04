// Only against a matching preview pointed at this disposable database. Never owner data.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {request} from 'node:http';
import pg from 'pg';
import {operate} from './editorial-account.js';
import {localConfig} from '../src/server/local-config.js';
import {adminCopy} from '../src/i18n/admin.js';
if(new URL(process.env.DATABASE_URL).pathname!=='/celitrip_editorial_test' || process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY!=='1')throw Error('Requires disposable editorial test preview with explicit demo opt-in.');
const pool=new pg.Pool(localConfig()),jar={},email='owner-demo@demo.invalid',password=randomBytes(24).toString('base64url');
async function call(path,body,extra={}){
 const r=await fetch('http://127.0.0.1:3000'+path,{method:body?'POST':'GET',redirect:'manual',headers:{origin:'http://127.0.0.1:3000','Content-Type':'application/json',cookie:Object.entries(jar).map(([k,v])=>k+'='+v).join('; '),...extra},...(body?{body:JSON.stringify(body)}:{})});
 for(const c of r.headers.getSetCookie()){const pair=c.split(';')[0],at=pair.indexOf('=');jar[pair.slice(0,at)]=pair.slice(at+1);}
 return {status:r.status,text:await r.text(),location:r.headers.get('location')};
}
try{
 const input={email,password,name:'HTTP owner demo exception test',operator:'Disposable HTTP test',reason:'Synthetic local demo password validation',grants:[{role:'language_reviewer',scope:'forno-demo',locale:'fr'}]};
 const exists=(await pool.query('SELECT id FROM "user" WHERE email=$1',[email])).rowCount;
 await operate(pool,exists?'recover':'create',input);if(exists)await operate(pool,'grant',input);
 await pool.query('DELETE FROM "rateLimit"');
 assert.equal((await call('/api/editorial')).status,401);
 assert.equal((await call('/api/auth/sign-in/email',{email,password:'wrong-long-password'})).status,401);
 assert.equal((await call('/api/editorial')).status,401);
 assert.equal((await call('/api/auth/sign-in/email',{email,password},{origin:'https://external.invalid'})).status,403);
 // Node fetch normalizes Host; use the HTTP primitive to actually send the hostile header.
 const badHost=await new Promise((resolve,reject)=>{const r=request('http://127.0.0.1:3000/en/editor/sign-in',{headers:{host:'external.invalid:3000'}},res=>{res.resume();resolve(res.statusCode);});r.on('error',reject);r.end();});
 assert.equal(badHost,403);
 assert.equal((await call('/api/auth/sign-in/email',{email,password})).status,200);
 const session=JSON.parse((await call('/api/auth/get-session')).text).session;
 assert.equal(session.localDemoPassword,true);assert.equal(session.mfaVerified,false);
 assert.equal(JSON.parse((await call('/api/editorial')).text).branches.length,1);
 assert.equal((await call('/api/editorial?id=tavola-demo')).status,403);
 assert.equal((await call('/api/editorial',{action:'publish',id:'forno-demo',revision:'forno-v2',cycle:0,reason:'No publisher permission'})).status,403);
 assert.equal((await call('/api/editorial',null,{'x-forwarded-for':'203.0.113.12'})).status,401);
 for(const locale of ['he','en','fr','ru']){
  const page=await call(`/${locale}/editor`);assert.equal(page.status,200);assert.ok(page.text.includes(adminCopy(locale).passwordMode));
 }
 const mfa=await call('/en/editor/mfa');
 // App Router may flush the shell before redirect(), returning a streamed meta redirect.
 assert.ok((mfa.status===307&&mfa.location==='/en/editor') ||
   (mfa.status===200&&mfa.text.includes('http-equiv="refresh"')&&mfa.text.includes('url=/en/editor')));
 await operate(pool,'revoke',input);assert.equal((await call('/api/editorial')).status,401);
 console.log('Demo HTTP checks passed: password/origin/host, truthful session marker, scoped reads/mutations, forwarded-client denial, four localized editorial pages, MFA redirect and revocation. Disposable DB only.');
}finally{await pool.end();}
