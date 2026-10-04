// Run only against the preview explicitly connected to celitrip_editorial_test.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import pg from 'pg';
import {symmetricDecrypt} from 'better-auth/crypto';
import {operate} from './editorial-account.js';
import {createAuth} from '../src/server/auth-config.js';
import {localConfig} from '../src/server/local-config.js';
if(new URL(process.env.DATABASE_URL).pathname!=='/celitrip_editorial_test')throw Error('Disposable editorial database required.');
const pool=new pg.Pool(localConfig()),auth=createAuth(pool),password=randomBytes(24).toString('base64url'),email=`admin-http-${randomBytes(5).toString('hex')}@demo.invalid`;
function client(){const jar={};return async(path,body)=>{const response=await fetch('http://127.0.0.1:3000'+path,{method:body?'POST':'GET',redirect:'manual',headers:{origin:'http://127.0.0.1:3000','content-type':'application/json',cookie:Object.entries(jar).map(([k,v])=>k+'='+v).join('; ')},...(body?{body:JSON.stringify(body)}:{})});for(const c of response.headers.getSetCookie()){const pair=c.split(';')[0],at=pair.indexOf('=');jar[pair.slice(0,at)]=pair.slice(at+1);}const text=await response.text();let data;try{data=JSON.parse(text);}catch{}return {status:response.status,text,data};};}
async function enroll(call,email,userId){assert.equal((await call('/api/auth/sign-in/email',{email,password})).status,200);assert.equal((await call('/api/administration?view=dashboard')).status,401);assert.equal((await call('/api/auth/two-factor/enable',{password,method:'totp'})).status,200);const row=(await pool.query('SELECT secret FROM "twoFactor" WHERE "userId"=$1',[userId])).rows[0];const key=await symmetricDecrypt({key:process.env.BETTER_AUTH_SECRET,data:row.secret});const code=(await auth.api.generateTOTP({body:{secret:key}})).code;assert.equal((await call('/api/auth/two-factor/verify-totp',{code})).status,200);}
try{
 await pool.query('DELETE FROM "rateLimit"');
 const grants=[...['editor','subject_reviewer','publisher','administrator'].map(role=>({role,scope:'rome',locale:'*'})),...['he','en','fr','ru'].map(locale=>({role:'language_reviewer',scope:'rome',locale}))];
 const user=await operate(pool,'create',{email,password,name:'HTTP administration demo',operator:'Disposable validation',reason:'Synthetic administration authorization tests',grants});const call=client();await enroll(call,email,user.id);
 for(const view of ['dashboard','destinations','categories','places','sources','translations','reviews','corrections','team','settings','activity'])assert.equal((await call('/api/administration?view='+view)).status,200,view);
 for(const locale of ['he','en','fr','ru']){const page=await call(`/${locale}/editor`);assert.equal(page.status,200);assert.ok(page.text.includes(`dir="${locale==='he'?'rtl':'ltr'}"`));}
 const me=(await call('/api/administration?view=team&q='+encodeURIComponent(email))).data.rows[0];
 assert.equal((await call('/api/administration',{action:'team',operation:'grant',email,version:me.version,grants,reason:'Self escalation attempt'})).status,403);
 assert.equal((await call('/api/administration',{action:'team',operation:'disable',email,version:me.version,reason:'Self disable attempt'})).status,403);
 const viewerEmail=`viewer-${randomBytes(5).toString('hex')}@demo.invalid`;
 const created=await call('/api/administration',{action:'team',operation:'create',email:viewerEmail,password,name:'HTTP French reviewer demo',grants:[{role:'language_reviewer',scope:'forno-demo',locale:'fr'}],reason:'Explicit synthetic locale-restricted reviewer'});assert.equal(created.status,200);
 const viewer=client();await pool.query('DELETE FROM "rateLimit"');await enroll(viewer,viewerEmail,created.data.id);
 const dashboard=await viewer('/api/administration?view=dashboard');assert.equal(dashboard.status,200);assert.equal(dashboard.data.counts.corrections,null);assert.ok(dashboard.data.counts.translations<=1);
 for(const view of ['team','settings','corrections'])assert.equal((await viewer('/api/administration?view='+view)).status,403);
 assert.equal((await viewer('/api/administration',{action:'settings',version:1,translations:{},reason:'Unauthorized settings'})).status,403);
 assert.equal((await viewer('/api/administration',{action:'team',operation:'create',reason:'Unauthorized account'})).status,403);
 assert.equal((await viewer('/api/administration',{action:'destination',kind:'country',labels:{},reason:'Unauthorized catalog'})).status,403);
 assert.equal((await viewer('/api/administration',{action:'translation',id:'forno-demo',expected:'forno-v2',locale:'ru',document:{}})).status,403);
 assert.equal((await viewer('/api/editorial',{action:'publish',id:'forno-demo',revision:'forno-v2',cycle:0,reason:'Unauthorized publication'})).status,403);
 const staff=(await call('/api/administration?view=team&q='+encodeURIComponent(viewerEmail))).data.rows[0];assert.ok(!JSON.stringify(staff).includes(password));
 assert.equal((await call('/api/administration',{action:'team',operation:'disable',email:viewerEmail,version:staff.version,reason:'Disable test identity'})).status,200);
 assert.equal((await viewer('/api/administration?view=dashboard')).status,401);
 assert.equal((await viewer('/api/auth/sign-in/email',{email:viewerEmail,password})).status,401);
 console.log('Administration HTTP checks passed: eleven sections, four localized shells, real MFA, aggregate/privacy scopes, direct mutation denials, protected self-access, account creation/disable and session revocation.');
}finally{await pool.end();}
