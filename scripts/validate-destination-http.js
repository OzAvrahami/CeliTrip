// Run only against the preview explicitly connected to celitrip_editorial_test.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import pg from 'pg';
import {symmetricDecrypt} from 'better-auth/crypto';
import {operate} from './editorial-account.js';
import {createAuth} from '../src/server/auth-config.js';
import {localConfig} from '../src/server/local-config.js';
if(new URL(process.env.DATABASE_URL).pathname!=='/celitrip_editorial_test')throw Error('Disposable editorial database required.');
const pool=new pg.Pool(localConfig()),auth=createAuth(pool),password=randomBytes(24).toString('base64url'),email=`destination-http-${randomBytes(5).toString('hex')}@demo.invalid`;
function client(){const jar={};return async(path,body)=>{const response=await fetch('http://127.0.0.1:3000'+path,{method:body?'POST':'GET',redirect:'manual',headers:{origin:'http://127.0.0.1:3000','content-type':'application/json',cookie:Object.entries(jar).map(([k,v])=>k+'='+v).join('; ')},...(body?{body:JSON.stringify(body)}:{})});for(const c of response.headers.getSetCookie()){const pair=c.split(';')[0],at=pair.indexOf('=');jar[pair.slice(0,at)]=pair.slice(at+1);}const text=await response.text();let data;try{data=JSON.parse(text);}catch{}return {status:response.status,text,data};};}
async function enroll(call,email,userId){assert.equal((await call('/api/auth/sign-in/email',{email,password})).status,200);assert.equal((await call('/api/administration?view=dashboard')).status,401);assert.equal((await call('/api/auth/two-factor/enable',{password,method:'totp'})).status,200);const row=(await pool.query('SELECT secret FROM "twoFactor" WHERE "userId"=$1',[userId])).rows[0];const key=await symmetricDecrypt({key:process.env.BETTER_AUTH_SECRET,data:row.secret});const code=(await auth.api.generateTOTP({body:{secret:key}})).code;assert.equal((await call('/api/auth/two-factor/verify-totp',{code})).status,200);}
try{
 await pool.query('DELETE FROM "rateLimit"');
 const grants=[...['editor','subject_reviewer','publisher','administrator'].map(role=>({role,scope:'rome',locale:'*'})),...['he','en','fr','ru'].map(locale=>({role:'language_reviewer',scope:'rome',locale}))];
 const user=await operate(pool,'create',{email,password,name:'Destination HTTP synthetic administrator',operator:'Disposable HTTP validation',reason:'Local destination permissions only',grants});const call=client();await enroll(call,email,user.id);
 const made=await call('/api/administration',{action:'destination',kind:'country',sourceLocale:'en',labels:{en:'Fictional HTTP country',he:'Synthetic HE',fr:'Synthetic FR',ru:'Synthetic RU'},internalNote:''});assert.equal(made.status,200);
 const id=made.data.id,read=await call('/api/administration?view=destination&id='+id);assert.equal(read.status,200);assert.equal(read.data.review_state,'draft');
 const hidden=await call('/en/destinations/'+id);assert.ok([200,404].includes(hidden.status));assert.ok(hidden.text.includes('This page'));assert.ok(!hidden.text.includes('Fictional HTTP country'));assert.ok(hidden.text.includes('noindex'));
 const transition=async(operation,extra={})=>{const r=(await call('/api/administration?view=destination&id='+id)).data;return call('/api/administration',{action:'destination-transition',operation,id,expected:r.revision_id,version:r.version,cycle:r.cycle,...extra});};
 const absent=await transition('publish');assert.equal(absent.status,400);assert.deepEqual(absent.data.fields,{confirmGeography:'confirmationRequired'});
 assert.equal((await transition('submit',{reason:''})).status,200,'original failing action now accepts no note');
 const invalid=await call('/api/administration',{action:'destination',kind:'country',sourceLocale:'en',labels:{en:''}});assert.equal(invalid.status,400);assert.deepEqual(invalid.data.fields,{'labels.en':'nameRequired'});
 assert.equal((await transition('publish',{confirmGeography:true,claims:[]})).data.error,'geographyOnly');
 assert.equal((await transition('publish',{confirmGeography:true})).status,200);
 const visible=await call('/en/destinations/'+id);assert.ok(visible.text.includes('Fictional HTTP country'));
 assert.equal((await transition('withdraw')).data.error,'reasonRequired');
 assert.equal((await transition('withdraw',{reason:'End disposable publication'})).status,200);
 assert.equal((await transition('archive',{reason:'End disposable QA record'})).status,200);
 const viewerEmail='destination-viewer-'+randomBytes(4).toString('hex')+'@demo.invalid';const viewerUser=await operate(pool,'create',{email:viewerEmail,password,name:'Synthetic French-only reviewer',operator:'Disposable validation',reason:'Direct scoped denials',grants:[{role:'language_reviewer',scope:'forno-demo',locale:'fr'}]});const viewer=client();await enroll(viewer,viewerEmail,viewerUser.id);
 assert.equal((await viewer('/api/administration?view=destination&id='+id)).status,403);
 for(const action of ['destination-generation','destination-transition','destination'])assert.equal((await viewer('/api/administration',{action,id,operation:'publish',kind:'country',source:'No authority',sourceLocale:'en',mode:'fictional'})).status,403);
 const anonymous=client();assert.equal((await anonymous('/api/administration?view=destination&id='+id)).status,401);
 const foreign=await fetch('http://127.0.0.1:3000/api/administration',{method:'POST',headers:{origin:'https://untrusted.invalid','Content-Type':'application/json'},body:JSON.stringify({action:'destination-generation'})});assert.equal(foreign.status,403);
 console.log('Destination HTTP checks passed: actual MFA, authorized draft persistence, anonymous/scoped/origin denials, action-specific field errors, optional-note submission, explicit geography confirmation, local publication/withdrawal/archive, substantive payload rejection, draft not-found/noindex without draft text. DeepL setup is deferred.');
}finally{await pool.end();}
