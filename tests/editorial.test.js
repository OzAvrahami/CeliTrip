import {destinations} from '../src/server/destinations.js';
import {translationService} from '../src/server/translation-service.js';
import {mergeGenerated} from '../src/lib/translation-state.js';
import {destinationCopy} from '../src/i18n/destinations.js';
import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import pg from 'pg';
import {runner} from 'node-pg-migrate';
import {symmetricDecrypt} from 'better-auth/crypto';
import {createAuth} from '../src/server/auth-config.js';
import {localConfig} from '../src/server/local-config.js';
import {editorialService} from '../src/server/editorial-service.js';
import {repository} from '../src/server/repository.js';
import {submitCorrection} from '../src/server/corrections.js';
import {operate} from '../scripts/editorial-account.js';
import {seed} from '../db/seeds/rome.js';
import {editorialCopy,editorialKeys} from '../src/i18n/editorial.js';
import {administration} from '../src/server/administration.js';
import {adminCopy} from '../src/i18n/admin.js';
let pool,auth,service,repo,env,p,user,jar={},branch,backup;
const password=randomBytes(24).toString('base64url'),email='workflow@demo.invalid';
const grants=[...['editor','subject_reviewer','publisher','administrator'].map(role=>({role,scope:'rome',locale:'*'})),...['he','en','fr','ru'].map(locale=>({role:'language_reviewer',scope:'rome',locale}))];
const operator={email,name:'Integration workflow',password,grants,operator:'Automated isolated test',reason:'Synthetic local integration test only'};
const headers=()=>new Headers({cookie:Object.entries(jar).map(([k,v])=>k+'='+v).join('; '),origin:'http://127.0.0.1:3000','Content-Type':'application/json','x-celitrip-local-ip':'127.0.0.1'});
async function call(path,body){const r=await auth.handler(new Request('http://127.0.0.1:3000/api/auth/'+path,{method:body?'POST':'GET',headers:headers(),...(body?{body:JSON.stringify(body)}:{})}));for(const c of r.headers.getSetCookie()){const pair=c.split(';')[0],at=pair.indexOf('=');jar[pair.slice(0,at)]=pair.slice(at+1);}return {status:r.status,data:await r.json()};}
async function principal(){const session=await auth.api.getSession({headers:headers()});return session?{userId:session.user.id,sessionId:session.session.id}:null;}
async function totp(){const record=(await pool.query('SELECT secret FROM "twoFactor" WHERE "userId"=$1',[user.id])).rows[0];const secret=await symmetricDecrypt({key:env.BETTER_AUTH_SECRET,data:record.secret});return (await auth.api.generateTOTP({body:{secret}})).code;}
const blocks=()=>Object.fromEntries(['he','en','fr','ru'].map(l=>[l,{title:'Fictional '+l,summary:'Synthetic local content; no real venue or human approval.'}]));
const strings=()=>Object.fromEntries(['he','en','fr','ru'].map(l=>[l,'Illustrative source '+l]));
const document=()=>({fictional:true,categories:['bakery','cafe'],address:null,translations:blocks(),claims:[{key:'utensils',subject:'new',predicate:'utensils',value:null,dimensions:['unknown'],copy:blocks(),observations:[{sourceKey:'venue',subject:'new',type:'venue',stance:'unresolved',title:strings(),statement:strings(),url:null}]}]});
before(async()=>{
 const admin=new pg.Pool(localConfig());try{if(!(await admin.query("SELECT 1 FROM pg_database WHERE datname='celitrip_editorial_test'")).rowCount)await admin.query('CREATE DATABASE celitrip_editorial_test');}finally{await admin.end();}
 const url=new URL(process.env.DATABASE_URL);url.pathname='/celitrip_editorial_test';env={...process.env,DATABASE_URL:url.href,BETTER_AUTH_SECRET:randomBytes(48).toString('base64url')};localConfig(env);
 // Only this explicitly disposable database is reset. The owner database is never seeded or reset.
 pool=new pg.Pool(localConfig(env));await pool.query('DROP SCHEMA public CASCADE');await pool.query('CREATE SCHEMA public');
 await runner({databaseUrl:url.href,dir:'db/migrations',direction:'up',migrationsTable:'pgmigrations',log:()=>{}});await seed(pool);auth=createAuth(pool,env);service=editorialService(pool);repo=repository(pool);user=await operate(pool,'create',operator);
});
after(async()=>{await pool?.end();});
test('public signup and foreign origins denied; password-only session cannot read editorial data',async()=>{
 assert.equal((await call('sign-up/email',{email:'bad@demo.invalid',password,name:'No signup'})).status,400);
 const bad=await auth.handler(new Request('http://127.0.0.1:3000/api/auth/sign-in/email',{method:'POST',headers:{origin:'https://untrusted.invalid','Content-Type':'application/json'},body:JSON.stringify({email,password})}));assert.equal(bad.status,403);
 assert.equal((await call('sign-in/email',{email,password})).status,200);p=await principal();assert.ok(p);await assert.rejects(service.list(p),/mfaRequired/);
 await assert.rejects(service.resolve(p,'00000000-0000-0000-0000-000000000000',1,'resolved','No MFA access'),/mfaRequired/);
 const enabled=await call('two-factor/enable',{password,method:'totp'});assert.equal(enabled.status,200);backup=enabled.data.backupCodes[0];await assert.rejects(service.list(p),/mfaRequired/);
 assert.equal((await call('two-factor/verify-totp',{code:'000000'})).status,401);
 assert.equal((await call('two-factor/verify-totp',{code:await totp()})).status,200);p=await principal();assert.ok((await service.list(p)).branches.length);
});
test('role, scope and locale denials apply to service reads and mutations',async()=>{
 const saved=(await pool.query('SELECT * FROM editorial_grant WHERE user_id=$1',[user.id])).rows;
 await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[user.id]);
 await pool.query("INSERT INTO editorial_grant VALUES($1,'language_reviewer','forno-demo','fr')",[user.id]);
 assert.equal((await service.list(p)).branches.length,1);
 await assert.rejects(service.read(p,'tavola-demo'),/forbidden/);
 await assert.rejects(service.save(p,null,null,document()),/forbidden/);
 await assert.rejects(service.transition(p,'forno-demo','forno-v1',0,'language','ru','Demo review'),/forbidden/);
 await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[user.id]);for(const g of saved)await pool.query('INSERT INTO editorial_grant VALUES($1,$2,$3,$4)',[g.user_id,g.role,g.scope,g.locale]);
});
test('draft persistence, immutable children, concurrent edit rejection and four translation gates',async()=>{
 branch=await service.save(p,null,null,document());assert.equal(await repo.entity(branch.id,'en'),null);
 const fresh=new pg.Pool(localConfig(env));try{assert.equal((await editorialService(fresh).read(p,branch.id)).revision,branch.revision);}finally{await fresh.end();}
 await assert.rejects(pool.query('UPDATE editorial_revision SET document=\'{}\' WHERE id=$1',[branch.revision]),/Append a new revision/);
 await assert.rejects(pool.query("INSERT INTO claim_revision VALUES('late',$1,$2,'late',NULL,ARRAY['unknown'],'{}')",[branch.revision,branch.id]),/sealed/);
 await assert.rejects(service.save(p,branch.id,'stale',document()),/conflict/);
 await service.transition(p,branch.id,branch.revision,0,'submit',null,'Synthetic review requested');
 await assert.rejects(service.transition(p,branch.id,branch.revision,0,'publish',null,'Synthetic publication'),/reviewsRequired/);
 await service.transition(p,branch.id,branch.revision,0,'subject',null,'Synthetic evidence review');
 for(const l of ['he','en','fr'])await service.transition(p,branch.id,branch.revision,0,'language',l,'Synthetic language review');
 await assert.rejects(service.transition(p,branch.id,branch.revision,0,'publish',null,'Synthetic publication'),/reviewsRequired/);
 assert.equal(await repo.entity(branch.id,'en'),null);
 await service.transition(p,branch.id,branch.revision,0,'language','ru','Synthetic language review');
 await service.transition(p,branch.id,branch.revision,0,'publish',null,'Synthetic publication');
 for(const l of ['he','en','fr','ru'])assert.equal((await repo.entity(branch.id,l)).revision_id,branch.revision);
});
test('material edits invalidate approvals; public pointer, return cycle and withdrawal are atomic',async()=>{
 const old=branch.revision;const d=(await service.read(p,branch.id)).document;d.translations.en.summary='Private changed draft';branch=await service.save(p,branch.id,old,d);
 assert.equal((await repo.entity(branch.id,'en')).revision_id,old);assert.equal((await service.read(p,branch.id)).reviews.length,0);
 await service.transition(p,branch.id,branch.revision,0,'submit',null,'Review changed content');
 await service.transition(p,branch.id,branch.revision,0,'subject',null,'Synthetic review');
 await service.transition(p,branch.id,branch.revision,0,'return',null,'Source needs reconsideration');
 await assert.rejects(service.transition(p,branch.id,branch.revision,0,'language','he','Outdated review'),/conflict/);
 await service.transition(p,branch.id,branch.revision,1,'submit',null,'Resubmit exact snapshot');
 await assert.rejects(service.transition(p,branch.id,branch.revision,1,'publish',null,'Cannot reuse old approvals'),/reviewsRequired/);
 await service.transition(p,branch.id,branch.revision,1,'withdraw',null,'Synthetic withdrawal demonstration');
 assert.equal(await repo.entity(branch.id,'en'),null);assert.ok((await service.read(p,branch.id)).events.some(e=>e.action==='withdraw'&&e.revision_id===old));
});
test('wrong-branch, chain scope, historical, conflict, unknown dates and stale sources stay explicit',async()=>{
 await assert.rejects(service.save(p,null,null,{...document(),chain_id:'forno-demo'}),/wrongScope/);
 const initial=await service.read(p,'tavola-demo');const d=initial.document;assert.ok(d.claims[0].dimensions.includes('chain_scope'));
 const copy=structuredClone(d);copy.claims[0].subject='forno-demo';await assert.rejects(service.save(p,'tavola-demo',initial.revision,copy),/wrongScope/);
 const wrongSource=structuredClone(d);wrongSource.claims[0].value=null;wrongSource.claims[0].observations[0].subject='forno-demo';await assert.rejects(service.save(p,'tavola-demo',initial.revision,wrongSource),/wrongScope/);
 d.claims[0].value=null;const chainDraft=await service.save(p,'tavola-demo',initial.revision,d);assert.equal((await service.read(p,'tavola-demo')).document.claims[0].subject,'demo-chain');assert.ok(chainDraft.revision);assert.equal((await repo.entity('tavola-demo','en')).revision_id,'tavola-v1');
 const a=await service.read(p,'forno-demo');const normal=await service.read(p,'forno-demo'); // newest M1 draft still private
 assert.equal(normal.revision,'forno-v2');
 const x=document();x.claims[0].observations[0].type='historical_record';await assert.rejects(service.save(p,null,null,x),/uncertainty/);
 x.claims[0].dimensions.push('historical','needs_review');x.claims[0].observations[0].expiresOn='2000-01-01';const historic=await service.save(p,null,null,x);assert.ok(historic.id);
 const stale=document();stale.claims[0].observations[0].expiresOn='2000-01-01';await assert.rejects(service.save(p,null,null,stale),/staleEvidence/);
 const conflict=document();conflict.claims[0].observations[0].stance='supports';conflict.claims[0].observations.push({...conflict.claims[0].observations[0],stance:'contradicts'});await assert.rejects(service.save(p,null,null,conflict),/uncertainty/);
 conflict.claims[0].dimensions.push('conflicting','needs_review');const result=await service.save(p,null,null,conflict);assert.equal((await service.read(p,result.id)).document.claims[0].observations.length,2);
 assert.equal((await repo.entity('forno-demo','en')).revision_id,'forno-v1');assert.equal(a.revision,'forno-v2');
});
test('corrections persist privately, validate references, throttle and never publish',async()=>{
 const input={entity:'forno-demo',revision:'forno-v1',claim:'fryer',message:'Fictional correction requiring investigation',contact:'private@demo.invalid'};
 const receipt=await submitCorrection(pool,input);assert.ok(receipt.receipt);assert.equal(Object.keys(receipt).length,1);
 assert.equal((await service.corrections(p))[0].contact,input.contact);
 await assert.rejects(submitCorrection(pool,{...input,claim:'chain-kitchen'}),/wrongScope/);
 await assert.rejects(submitCorrection(pool,{...input,revision:'forno-v2'}),/conflict/);
 await assert.rejects(submitCorrection(pool,{...input,website:'bot'}),/invalid/);
 await service.resolve(p,receipt.receipt,1,'resolved','Demo investigation; no automatic changes');
 await assert.rejects(service.resolve(p,receipt.receipt,1,'triaged','Stale form'),/conflict/);
 assert.equal((await repo.entity('forno-demo','en')).revision_id,'forno-v1');
 assert.ok(!JSON.stringify(await repo.evidence('forno-demo','en')).includes('private@'));
 for(let i=0;i<5;i++)await submitCorrection(pool,input);await assert.rejects(submitCorrection(pool,input),/rateLimited/);
});
test('concurrent saves serialize; publication rollback preserves pointer and audit; revoked reviewers cannot authorize publication',async()=>{
 const created=await service.save(p,null,null,document());const doc=(await service.read(p,created.id)).document;
 const edits=await Promise.allSettled([service.save(p,created.id,created.revision,doc),service.save(p,created.id,created.revision,doc)]);
 assert.equal(edits.filter(x=>x.status==='fulfilled').length,1);assert.equal(edits.find(x=>x.status==='rejected').reason.code,'conflict');
 const revision=edits.find(x=>x.status==='fulfilled').value.revision;
 await service.transition(p,created.id,revision,0,'submit',null,'Synthetic concurrent edit review');
 await service.transition(p,created.id,revision,0,'subject',null,'Synthetic subject approval');
 for(const l of ['he','en','fr','ru'])await service.transition(p,created.id,revision,0,'language',l,'Synthetic language approval');
 await pool.query("DELETE FROM editorial_grant WHERE user_id=$1 AND role='language_reviewer' AND locale='ru'",[user.id]);
 await assert.rejects(service.transition(p,created.id,revision,0,'publish',null,'Cannot reuse revoked reviewer authority'),/reviewsRequired/);
 await pool.query("INSERT INTO editorial_grant VALUES($1,'language_reviewer','rome','ru')",[user.id]);
 // Force a failure after the pointer update. The entire transaction must roll back.
 await pool.query("CREATE FUNCTION test_fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='publish' THEN RAISE EXCEPTION 'Simulated audit failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER test_audit_failure BEFORE INSERT ON editorial_audit FOR EACH ROW EXECUTE FUNCTION test_fail_audit();");
 try{await assert.rejects(service.transition(p,created.id,revision,0,'publish',null,'Rollback demonstration'),/Simulated audit failure/);assert.equal(await repo.entity(created.id,'en'),null);assert.equal((await service.read(p,created.id)).state,'review');}
 finally{await pool.query('DROP TRIGGER test_audit_failure ON editorial_audit; DROP FUNCTION test_fail_audit();');}
 await service.transition(p,created.id,revision,0,'publish',null,'Successful atomic local publication');
 assert.equal((await repo.entity(created.id,'en')).revision_id,revision);
});
test('sign-in challenge, backup recovery, revocation and controlled reenrollment',async()=>{
 await call('sign-out',{});jar={};assert.equal((await call('sign-in/email',{email,password})).data.twoFactorRedirect,true);assert.equal(await principal(),null);
 const recovered=await call('two-factor/verify-backup-code',{code:backup});assert.equal(recovered.status,200);p=await principal();await assert.rejects(service.list(p),/mfaRequired/);
 assert.equal((await call('two-factor/verify-totp',{code:await totp()})).status,200);p=await principal();assert.ok((await service.list(p)).branches.length);
 await service.revoke(p,user.id,'Revoke synthetic test sessions');await assert.rejects(service.list(p),/mfaRequired/);
 await operate(pool,'recover',operator);assert.equal((await pool.query('SELECT "twoFactorEnabled" FROM "user" WHERE id=$1',[user.id])).rows[0].twoFactorEnabled,false);assert.equal((await pool.query('SELECT 1 FROM session WHERE "userId"=$1',[user.id])).rowCount,0);
 jar={};await call('sign-in/email',{email,password});p=await principal();await assert.rejects(service.list(p),/mfaRequired/);
});
test('authentication throttles invalid logins and editorial dictionaries cover four languages',async()=>{
 let limited=false;for(let i=0;i<8;i++){const r=await call('sign-in/email',{email,password:'incorrect-long-password'});if(r.status===429)limited=true;}assert.ok(limited);
 for(const l of ['he','en','fr','ru']){const t=editorialCopy(l);assert.deepEqual(Object.keys(t),editorialKeys);assert.ok(Object.values(t).every(v=>typeof v==='string'&&v.length&&!/\?{2,}/.test(v)));if(l==='he')assert.ok(Object.values(t).every(v=>/[\u0590-\u05ff]/.test(v)));if(l==='ru')assert.ok(Object.values(t).every(v=>/[\u0400-\u04ff]/.test(v)));}
});

test('owner demo password sessions preserve authenticators, require live scoped sessions, and fail closed when disabled',async()=>{
 const oldFlag=process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY;
 const demoEnv={...env,CELITRIP_LOCAL_DEMO_PASSWORD_ONLY:'1'};
 const demoAuth=createAuth(pool,demoEnv),demoJar={};
 const demoHeaders=()=>new Headers({host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000','Content-Type':'application/json',cookie:Object.entries(demoJar).map(([k,v])=>k+'='+v).join('; ')});
 const demoCall=async(path,body)=>{
  const r=await demoAuth.handler(new Request('http://127.0.0.1:3000/api/auth/'+path,{method:'POST',headers:demoHeaders(),body:JSON.stringify(body)}));
  for(const c of r.headers.getSetCookie()){const pair=c.split(';')[0],at=pair.indexOf('=');demoJar[pair.slice(0,at)]=pair.slice(at+1);}
  return {status:r.status,data:await r.json()};
 };
 const demoPrincipal=async()=>{const s=await demoAuth.api.getSession({headers:demoHeaders()});return s?{userId:s.user.id,sessionId:s.session.id,requestHeaders:demoHeaders()}:null;};
 const demoOperator={...operator,email:'owner-demo@demo.invalid',name:'Password exception test',grants:[{role:'language_reviewer',scope:'forno-demo',locale:'fr'}]};
 const demoUser=await operate(pool,'create',demoOperator);
 try{
  process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY='1';
  await pool.query('DELETE FROM "rateLimit"');
  assert.equal((await demoCall('sign-in/email',{email:demoOperator.email,password:'wrong-long-password'})).status,401);
  assert.equal(await demoPrincipal(),null);
  assert.equal((await demoCall('sign-in/email',{email:demoOperator.email,password})).status,200);
  let dp=await demoPrincipal();assert.ok(dp);
  const marker=async()=> (await pool.query('SELECT "mfaVerified","localDemoPassword" FROM session WHERE id=$1',[dp.sessionId])).rows[0];
  assert.deepEqual(await marker(),{mfaVerified:false,localDemoPassword:true});
  assert.equal((await service.list(dp)).branches.length,1);
  await assert.rejects(service.read(dp,'tavola-demo'),/forbidden/);
  await assert.rejects(service.save(dp,null,null,document()),/forbidden/);
  await assert.rejects(service.transition(dp,'forno-demo','forno-v2',0,'language','ru','Wrong locale'),/forbidden/);
  await assert.rejects(service.transition(dp,'forno-demo','forno-v2',0,'publish',null,'No publisher role'),/forbidden/);
  await assert.rejects(service.list({...dp,requestHeaders:new Headers({host:'public.example'})}),/mfaRequired/);
  await assert.rejects(service.list({...dp,requestHeaders:undefined}),/mfaRequired/);
  process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY='0';
  await assert.rejects(service.list(dp),/mfaRequired/);
  process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY='1';
  // Enroll an actual test authenticator, then prove the exception leaves its bytes intact.
  const setup=await demoCall('two-factor/enable',{password,method:'totp'});assert.equal(setup.status,200);
  const factor=async()=>(await pool.query('SELECT * FROM "twoFactor" WHERE "userId"=$1',[demoUser.id])).rows[0];
  const key=await symmetricDecrypt({key:env.BETTER_AUTH_SECRET,data:(await factor()).secret});
  const code=(await demoAuth.api.generateTOTP({body:{secret:key}})).code;
  assert.equal((await demoCall('two-factor/verify-totp',{code})).status,200);
  const enrolled=await factor();
  await demoCall('sign-out',{});await pool.query('DELETE FROM "rateLimit"');
  const signed=await demoCall('sign-in/email',{email:demoOperator.email,password});
  assert.equal(signed.status,200);assert.notEqual(signed.data.twoFactorRedirect,true);
  dp=await demoPrincipal();assert.deepEqual(await marker(),{mfaVerified:false,localDemoPassword:true});
  assert.equal((await service.list(dp)).branches.length,1);
  assert.deepEqual(await factor(),enrolled);
  assert.equal((await pool.query('SELECT "twoFactorEnabled" FROM "user" WHERE id=$1',[demoUser.id])).rows[0].twoFactorEnabled,true);
  // Expiry and operator revocation still deny the same password-only principal.
  await pool.query('UPDATE session SET "expiresAt"=now()-interval \'1 second\' WHERE id=$1',[dp.sessionId]);
  await assert.rejects(service.list(dp),/mfaRequired/);
  await demoCall('sign-in/email',{email:demoOperator.email,password});dp=await demoPrincipal();
  await operate(pool,'revoke',demoOperator);await assert.rejects(service.list(dp),/mfaRequired/);
  // Once disabled, enrolled demo account receives the normal challenge.
  demoEnv.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY='0';process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY='0';
  assert.equal((await demoCall('sign-in/email',{email:demoOperator.email,password})).data.twoFactorRedirect,true);
  assert.equal(await demoPrincipal(),null);assert.deepEqual(await factor(),enrolled);
  // Recovery is not a password sign-in and cannot mint the demo marker.
  demoEnv.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY='1';process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY='1';
  assert.equal((await demoCall('two-factor/verify-backup-code',{code:setup.data.backupCodes[0]})).status,200);
  dp=await demoPrincipal();assert.deepEqual(await marker(),{mfaVerified:false,localDemoPassword:false});
  await assert.rejects(service.list(dp),/mfaRequired/);
 }finally{if(oldFlag===undefined)delete process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY;else process.env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY=oldFlag;}
});

let admin,adminP,country,city,category;
test('administration catalog persists drafts, preserves references, detects stale updates and never publishes destinations',async()=>{
 await pool.query('DELETE FROM "rateLimit"');jar={};
 user=await operate(pool,'create',{...operator,email:'workspace-admin@demo.invalid',name:'Workspace test administrator'});
 await call('sign-in/email',{email:'workspace-admin@demo.invalid',password});await call('two-factor/enable',{password,method:'totp'});await call('two-factor/verify-totp',{code:await totp()});adminP=await principal();admin=administration(pool);
 const names=Object.fromEntries(['he','en','fr','ru'].map(l=>[l,'Fictional destination '+l]));
 country=await admin.saveCatalog(adminP,'destination',{kind:'country',labels:names,reason:'Synthetic country draft'});
 city=await admin.saveCatalog(adminP,'destination',{kind:'city',parent:country.id,labels:{...names,en:'Fictional city'},reason:'Synthetic city draft'});
 category=await admin.saveCatalog(adminP,'category',{labels:{...names,en:'Fictional category'},reason:'Synthetic category'});
 assert.equal(await repo.entity(city.id,'en'),null);
 await assert.rejects(destinations(pool).transition(adminP,{id:country.id,expected:country.revision,version:1,cycle:0,action:'archive',reason:'Referenced parent cannot archive'}),/referencesInUse/);
 await assert.rejects(admin.saveCatalog(adminP,'destination',{id:country.id,expected:country.revision,version:1,kind:'country',labels:names,state:'archived',reason:'Dropdown cannot archive'}),/explicitActionRequired/);
 await assert.rejects(admin.saveCatalog(adminP,'destination',{id:city.id,version:9,kind:'city',parent:country.id,labels:names,reason:'Stale edit rejected'}),/conflict/);
 assert.equal((await admin.read(adminP,'destinations',{q:'Fictional city'})).total,1);
 const fresh=new pg.Pool(localConfig(env));try{assert.equal((await administration(fresh).read(adminP,'categories',{q:'Fictional category'})).total,1);}finally{await fresh.end();}
 assert.equal((await repo.entity('rome','en')).revision_id,'rome-v1');
});
test('administration scopes aggregate counts, activity, registries and private contacts before pagination',async()=>{
 const original=(await pool.query('SELECT role,scope,locale FROM editorial_grant WHERE user_id=$1',[adminP.userId])).rows;
 try{
 await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[adminP.userId]);await pool.query("INSERT INTO editorial_grant VALUES($1,'language_reviewer','mercato-demo','fr')",[adminP.userId]);
 const dash=await admin.read(adminP,'dashboard');assert.equal(dash.counts.corrections,null);assert.ok(dash.counts.translations<=1);assert.ok(dash.work.every(r=>r.id==='mercato-demo'));
 assert.equal((await admin.read(adminP,'places')).total,1);
 assert.ok((await admin.read(adminP,'sources',{history:'all'})).rows.every(r=>r.entity_id==='mercato-demo'));
 assert.ok((await admin.activity(adminP)).rows.every(r=>r.entity_id==='mercato-demo'&&!r.action.startsWith('correction')));
 for(const view of ['corrections','team','settings'])await assert.rejects(admin.read(adminP,view),/forbidden/);
 await assert.rejects(admin.saveCatalog(adminP,'category',{labels:{},reason:'No catalog permission'}),/forbidden/);
 const record=await service.read(adminP,'mercato-demo');const copy=structuredClone(record.document);copy.translations.fr.summary='French-only draft';copy.translations.en.summary='Attempted unauthorized English mutation';
 const saved=await service.save(adminP,'mercato-demo',record.revision,copy,'fr');const after=await service.read(adminP,'mercato-demo');assert.equal(after.document.translations.fr.summary,'French-only draft');assert.equal(after.document.translations.en.summary,record.document.translations.en.summary);
 await assert.rejects(service.save(adminP,'mercato-demo',saved.revision,copy,'ru'),/forbidden/);
 assert.equal((await repo.entity('mercato-demo','en')).revision_id,'mercato-v1');
 }finally{await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[adminP.userId]);for(const g of original)await pool.query('INSERT INTO editorial_grant VALUES($1,$2,$3,$4)',[adminP.userId,g.role,g.scope,g.locale]);}
});
test('workspace lists search, filter, sort and paginate real revisions; draft translation states and review invalidation are exact',async()=>{
 for(let i=0;i<12;i++){const d=document();d.translations.en.title='Pagination example '+String(i).padStart(2,'0');d.categories=[category.id];await service.save(adminP,null,null,d);}
 const first=await admin.read(adminP,'places',{q:'Pagination example',sort:'name',category:category.id}),second=await admin.read(adminP,'places',{q:'Pagination example',sort:'name',page:'2'});
 assert.equal(first.total,12);assert.equal(first.rows.length,10);assert.equal(second.rows.length,2);assert.equal(new Set([...first.rows,...second.rows].map(r=>r.id)).size,12);
 for(const locale of ['en','he','fr','ru']){const sources=await admin.read(adminP,'sources',{sort:'name',history:'all',uiLocale:locale});const titles=sources.rows.map(s=>s.title[locale]);assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b,locale)));}
 const r=first.rows[0],d=structuredClone(r.document);d.translations.ru.summary='';const next=await service.save(adminP,r.id,r.revision,d);let model=(await admin.records(adminP)).find(x=>x.id===r.id);assert.equal(model.states.ru,'missing');
 await service.transition(adminP,r.id,next.revision,0,'submit',null,'Synthetic review request');await service.transition(adminP,r.id,next.revision,0,'subject',null,'Synthetic subject review');
 await assert.rejects(service.transition(adminP,r.id,next.revision,0,'language','ru','Incomplete translation'),/missingTranslation/);
 for(const l of ['he','en','fr'])await service.transition(adminP,r.id,next.revision,0,'language',l,'Synthetic translation check');
 model=(await admin.records(adminP)).find(x=>x.id===r.id);assert.equal(model.states.fr,'approved');assert.equal(model.ready,false);
 d.translations.ru.summary='Restored fictional Russian';const newer=await service.save(adminP,r.id,next.revision,d);model=(await admin.records(adminP)).find(x=>x.id===r.id);assert.equal(model.states.fr,'outdated');assert.equal(model.reviews.length,0);assert.notEqual(newer.revision,next.revision);
 await assert.rejects(admin.saveCatalog(adminP,'category',{id:category.id,version:1,labels:{he:'בדיקה',en:'Test',fr:'Test',ru:'Тест'},archived:true,reason:'Category in use'}),/referencesInUse/);
});
test('correction assignment validates scoped active editors, persists private history and rejects stale updates',async()=>{
 await pool.query("DELETE FROM submission_limit WHERE bucket='local-corrections'");
 const receipt=await submitCorrection(pool,{entity:'forno-demo',revision:'forno-v1',message:'Private synthetic assignment request',contact:'assignment@demo.invalid'});
 await assert.rejects(admin.correction(adminP,{id:receipt.receipt,version:1,state:'triaged',assigned:'missing-account',reason:'No eligible editor'}),/invalidAssignee/);
 await admin.correction(adminP,{id:receipt.receipt,version:1,state:'triaged',assigned:adminP.userId,reason:'Assigned to scoped synthetic editor'});
 await assert.rejects(admin.correction(adminP,{id:receipt.receipt,version:1,state:'resolved',reason:'Stale correction form'}),/conflict/);
 let inbox=await admin.corrections(adminP,{state:'triaged',assigned:'me'});const row=inbox.rows.find(r=>r.id===receipt.receipt);assert.equal(row.assigned_to,adminP.userId);assert.equal(row.history.length,1);
 await admin.correction(adminP,{id:row.id,version:row.version,state:'resolved',assigned:adminP.userId,reason:'Closed without publishing or editing a claim'});
 inbox=await admin.corrections(adminP,{state:'resolved'});assert.equal(inbox.rows.find(r=>r.id===row.id).history.length,2);
 assert.equal((await repo.entity('forno-demo','en')).revision_id,'forno-v1');assert.ok(!JSON.stringify(await repo.evidence('forno-demo','en')).includes('assignment@'));
});
test('administrator account operations reject self-escalation, last-admin removal and concurrent access edits',async()=>{
 const self=(await admin.read(adminP,'team',{q:'workspace-admin'})).rows[0];
 await assert.rejects(admin.team(adminP,{operation:'grant',email:self.email,version:self.version,grants:[],reason:'Self escalation denied'}),/selfChange/);
 await assert.rejects(admin.team(adminP,{operation:'disable',email:self.email,version:self.version,reason:'Self disable denied'}),/selfChange/);
 // Remove only other disposable administrators to exercise the operator-level last-admin invariant.
 await pool.query("DELETE FROM editorial_grant WHERE role='administrator' AND user_id<>$1",[adminP.userId]);
 await assert.rejects(operate(pool,'disable',{email:self.email,operator:'Synthetic test operator',reason:'Last admin must remain'}),/lastAdministrator/);
 const input={operation:'create',email:'staff-demo@demo.invalid',password,name:'Synthetic staff',grants:[{role:'editor',scope:'forno-demo',locale:'*'}],reason:'Create scoped local demo staff'};await admin.team(adminP,input);
 const staff=(await admin.read(adminP,'team',{q:'staff-demo'})).rows[0];assert.ok(!JSON.stringify(staff).includes(password));assert.ok(!('secret' in staff));
 await admin.team(adminP,{operation:'disable',email:staff.email,version:staff.version,reason:'Disable synthetic staff access'});
 await assert.rejects(admin.team(adminP,{operation:'enable',email:staff.email,version:staff.version,reason:'Stale account form'}),/conflict/);
 jar={};assert.equal((await call('sign-in/email',{email:staff.email,password})).status,401);
 const disabled=(await admin.read(adminP,'team',{q:'staff-demo'})).rows[0];await admin.team(adminP,{operation:'enable',email:staff.email,version:disabled.version,reason:'Re-enable synthetic staff access'});
 assert.equal((await admin.read(adminP,'team',{q:'staff-demo'})).rows[0].disabled,false);
});
test('persisted localized site identity is bounded and concurrent settings writes are rejected',async()=>{
 const setting=await admin.read(adminP,'settings');const translations=Object.fromEntries(['he','en','fr','ru'].map(l=>[l,{name:'CeliTrip test '+l,tagline:'Fictional local workspace '+l}]));
 await admin.settings(adminP,{version:setting.version,translations,reason:'Synthetic identity update'});
 await assert.rejects(admin.settings(adminP,{version:setting.version,translations,reason:'Stale settings update'}),/conflict/);
 assert.deepEqual((await admin.read(adminP,'settings')).translations,translations);
 for(const l of ['he','en','fr','ru']){const t=adminCopy(l);assert.ok(Object.values(t).every(v=>typeof v==='string'&&v.length&&!/\?{2,}/.test(v)));assert.deepEqual(Object.keys(t),Object.keys(adminCopy('en')));}
});

test('team chronology sorting uses persisted account dates independently of names',async()=>{
 auth=createAuth(pool,env);jar={};
 user=await operate(pool,'create',{...operator,email:'chronology-admin@demo.invalid',name:'Chronology administrator',grants:[{role:'administrator',scope:'rome',locale:'*'}]});
 assert.equal((await call('sign-in/email',{email:'chronology-admin@demo.invalid',password})).status,200);
 assert.equal((await call('two-factor/enable',{password,method:'totp'})).status,200);
 assert.equal((await call('two-factor/verify-totp',{code:await totp()})).status,200);
 const actor=await principal(),workspace=administration(pool),ids=[];
 for(const [i,name] of ['Zulu','Alpha','Middle'].entries()){
  const account=await operate(pool,'create',{...operator,email:`chronology-${i}@demo.invalid`,name:'Chronology fixture '+name,grants:[{role:'editor',scope:'rome',locale:'*'}]});ids.push(account.id);
  // Explicit synthetic account dates in the disposable DB, never venue evidence.
  await pool.query('UPDATE "user" SET "createdAt"=$2 WHERE id=$1',[account.id,`200${i+1}-01-01T00:00:00Z`]);
 }
 const newest=await workspace.read(actor,'team',{q:'Chronology fixture',sort:'newest'}),oldest=await workspace.read(actor,'team',{q:'Chronology fixture',sort:'oldest'}),named=await workspace.read(actor,'team',{q:'Chronology fixture',sort:'name'});
 assert.deepEqual(newest.rows.map(r=>r.id),[...ids].reverse());assert.deepEqual(oldest.rows.map(r=>r.id),ids);assert.deepEqual(named.rows.map(r=>r.id),[ids[1],ids[2],ids[0]]);
 assert.equal(newest.total,3);assert.ok(newest.rows.every(r=>!('password' in r)&&!('secret' in r)));
});
test('new city branches obey inherited scopes and custom categories survive the public projection',async()=>{
 const d={...document(),destination:city.id,categories:[category.id]};
 await assert.rejects(service.save(adminP,null,null,d),/forbidden/);
 for(const g of grants)if(g.role!=='administrator')await pool.query('INSERT INTO editorial_grant VALUES($1,$2,$3,$4)',[adminP.userId,g.role,country.id,g.locale]);
 const branch=await service.save(adminP,null,null,d);assert.equal((await service.read(adminP,branch.id)).entity.parent_id,city.id);
 assert.equal((await admin.read(adminP,'places',{destination:city.id})).total,1);
 await service.transition(adminP,branch.id,branch.revision,0,'submit',null,'Synthetic new-city branch review');await service.transition(adminP,branch.id,branch.revision,0,'subject',null,'Synthetic scoped subject review');
 for(const l of ['he','en','fr','ru'])await service.transition(adminP,branch.id,branch.revision,0,'language',l,'Synthetic scoped language review');
 await service.transition(adminP,branch.id,branch.revision,0,'publish',null,'Local fictional branch only; destination coverage remains draft');
 assert.equal(await repo.entity(branch.id,'fr'),null,'draft parent suppresses branch public reads');
 for(const id of [country.id,city.id])await publishDestination(id);
 assert.deepEqual((await repo.entity(branch.id,'fr')).categories,[category.id]);assert.ok((await repo.categories()).some(c=>c.id===category.id));assert.equal(await repo.entity(city.id,'en'),null);
 await service.transition(adminP,branch.id,branch.revision,0,'withdraw',null,'End scoped local test');assert.equal(await repo.entity(branch.id,'fr'),null);
});

async function destinationAction(id,action,locale){const svc=destinations(pool),r=await svc.read(adminP,id);await svc.transition(adminP,{id,expected:r.revision_id,version:r.version,cycle:r.cycle,action,locale,confirmGeography:true,reason:'Synthetic local destination validation'});return svc.read(adminP,id);}
async function publishDestination(id){await destinationAction(id,'submit');await destinationAction(id,'subject');for(const l of ['he','en','fr','ru'])await destinationAction(id,'language',l);return destinationAction(id,'publish');}

test('destination revisions gate publication, preserve published drafts, enforce hierarchy and archive explicitly',async()=>{
 const svc=destinations(pool),names={he:'ארץ בדיקה',en:'Fictional test country',fr:'Pays fictif',ru:'Вымышленная страна'};
 const made=await svc.save(adminP,{kind:'country',sourceLocale:'en',labels:names,mode:'fictional',reason:'Synthetic destination workflow'});
 assert.equal(await repo.destination(made.id,'en'),null);
 await destinationAction(made.id,'submit');
 await destinationAction(made.id,'subject');for(const l of ['he','en','fr'])await destinationAction(made.id,'language',l);
 await destinationAction(made.id,'language','ru');
 await pool.query("CREATE FUNCTION reject_destination_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic rollback';END $$;CREATE TRIGGER destination_rollback BEFORE INSERT ON destination_publication FOR EACH ROW EXECUTE FUNCTION reject_destination_test()");
 await assert.rejects(destinationAction(made.id,'publish'),/synthetic rollback/);assert.equal(await repo.destination(made.id,'en'),null);
 await pool.query('DROP TRIGGER destination_rollback ON destination_publication;DROP FUNCTION reject_destination_test()');await destinationAction(made.id,'publish');
 assert.equal((await repo.destination(made.id,'en')).title,names.en);
 let r=await svc.read(adminP,made.id);const changed=await svc.save(adminP,{id:made.id,expected:r.revision_id,version:r.version,kind:'country',sourceLocale:'en',labels:{...names,en:'PRIVATE newer draft'},mode:'fictional',reason:'Private revision must not leak'});
 await assert.rejects(svc.save(adminP,{id:made.id,expected:r.revision_id,version:r.version,kind:'country',sourceLocale:'en',labels:names,reason:'Stale browser tab'}),/conflict/);
 r=await svc.read(adminP,made.id);assert.equal(r.reviews.length,0);assert.equal(r.published_revision,made.revision);assert.equal((await repo.destination(made.id,'en')).title,names.en);
 assert.equal((await admin.read(adminP,'destinations',{state:'publishedDraft'})).rows.some(x=>x.id===made.id),true);
 await assert.rejects(pool.query('UPDATE destination_revision SET labels=\'{}\' WHERE id=$1',[changed.revision]),/Append a new revision/);
 await assert.rejects(destinationAction(made.id,'archive'),/referencesInUse/);await destinationAction(made.id,'withdraw');assert.equal(await repo.destination(made.id,'en'),null);
 await destinationAction(made.id,'archive');r=await svc.read(adminP,made.id);assert.equal(r.state,'archived');await assert.rejects(destinationAction(made.id,'submit'),/invalidState/);await destinationAction(made.id,'restore');assert.equal((await svc.read(adminP,made.id)).review_state,'draft');
 const child=await svc.save(adminP,{kind:'city',parent:made.id,sourceLocale:'en',labels:names,reason:'Fictional child draft'});
 await destinationAction(child.id,'submit');await destinationAction(child.id,'subject');for(const l of ['he','en','fr','ru'])await destinationAction(child.id,'language',l);
 await assert.rejects(destinationAction(child.id,'publish'),/parentNotPublished/);
 await assert.rejects(destinationAction(made.id,'archive'),/referencesInUse/);
 const other=new pg.Pool(localConfig(env));try{assert.equal((await destinations(other).read(adminP,child.id)).entity_id,child.id);}finally{await other.end();}
});

test('destination generation receipts persist provenance, preserve corrections and reject stale source responses',async()=>{
 const labels={he:'שם סינתטי',en:'Synthetic source',fr:'Nom synthétique',ru:'Синтетическое имя'};
 // Injected provider results test contracts only; they are not evidence of live machine translation.
 let release;const svc=destinations(pool,{translator:{translate:async()=>labels,geography:async()=>[{labels,identity:{provider:'wikidata',id:'Q999999999',country:'Q999999999'}}]}});
 const input={kind:'country',sourceLocale:'en',source:labels.en,mode:'fictional'};
 const generated=await svc.generation(adminP,input);const made=await svc.save(adminP,{...input,labels:generated.labels,receipt:generated.receipt,reason:'Synthetic provider contract'});
 let r=await svc.read(adminP,made.id);assert.equal(r.provenance.fr.method,'deepl');assert.equal(r.provenance.fr.receipt,generated.receipt);assert.equal(r.provenance.fr.sourceRevision,made.revision);
 let params={...input,id:made.id,expected:r.revision_id,version:r.version,labels:{...r.labels,fr:'Manually corrected'},manualLocales:['fr'],reason:'Preserve explicit correction'};
 await svc.save(adminP,params);r=await svc.read(adminP,made.id);params={...params,expected:r.revision_id,version:r.version,source:'Changed source',labels:{...r.labels,en:'Changed source'}};
 const regen=await svc.generation(adminP,params);
 await assert.rejects(svc.save(adminP,{...params,receipt:regen.receipt,labels:regen.labels,manualLocales:[]}),/protectedTranslation/);
 const newer=await svc.save(adminP,{...params,receipt:regen.receipt,labels:{...regen.labels,fr:r.labels.fr}});r=await svc.read(adminP,made.id);assert.equal(r.labels.fr,'Manually corrected');assert.equal(r.provenance.fr.method,'manual');
 await assert.rejects(svc.save(adminP,{...params,expected:r.revision_id,version:r.version,labels:r.labels,receipt:regen.receipt}),/staleTranslation/);
 const delayed=destinations(pool,{translator:{translate:()=>new Promise(resolve=>{release=()=>resolve(labels);})}});
 const waiting=delayed.generation(adminP,{...input,id:made.id,expected:newer.revision,version:r.version});
 while(!release)await new Promise(resolve=>setTimeout(resolve,5));
 await svc.save(adminP,{...params,expected:r.revision_id,version:r.version,labels:{...r.labels,en:'Saved during request'}});release();await assert.rejects(waiting,/conflict/);
 const original={he:'A',en:'B',fr:'C',ru:'D'};assert.deepEqual(mergeGenerated(original,labels,original,'new','old'),original);
 assert.equal(mergeGenerated({...original,fr:'Edited during request'},labels,original,'same','same',['ru']).fr,'Edited during request');
 assert.equal(mergeGenerated(original,labels,original,'same','same',['ru']).ru,'D');
});

test('destination permissions recheck role, locale, reviewer revocation and live sessions',async()=>{
 const svc=destinations(pool),r=await svc.read(adminP,country.id),savedGrants=(await pool.query('SELECT * FROM editorial_grant WHERE user_id=$1',[adminP.userId])).rows;
 try{
  await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[adminP.userId]);await pool.query("INSERT INTO editorial_grant VALUES($1,'language_reviewer',$2,'fr')",[adminP.userId,country.id]);
  await svc.read(adminP,country.id);await assert.rejects(svc.read(adminP,'rome'),/forbidden/);
  await assert.rejects(svc.generation(adminP,{kind:'country',sourceLocale:'en',source:'Private',mode:'fictional'}),/forbidden/);
  await assert.rejects(svc.save(adminP,{id:country.id}),/forbidden/);
  for(const action of ['submit','publish','archive','withdraw'])await assert.rejects(svc.transition(adminP,{id:country.id,expected:r.revision_id,version:r.version,cycle:r.cycle,action,reason:'Direct denial'}),/forbidden/);
  await assert.rejects(svc.transition(adminP,{id:country.id,expected:r.revision_id,version:r.version,cycle:r.cycle,action:'language',locale:'ru',reason:'Wrong locale'}),/forbidden/);
  assert.equal((await svc.read(adminP,country.id)).reviews.length,1,'only the still-authorized French review remains valid');
 }finally{await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[adminP.userId]);for(const g of savedGrants)await pool.query('INSERT INTO editorial_grant VALUES($1,$2,$3,$4)',[g.user_id,g.role,g.scope,g.locale]);}
 await assert.rejects(svc.read({...adminP,sessionId:'revoked'},country.id),/mfaRequired/);
});

test('provider integration bounds payloads, fails honestly without configuration and geographic lookup never invents labels',async()=>{
 await assert.rejects(translationService({env:{}}).translate({source:'Fictional label',sourceLocale:'en'}),/translationNotConfigured/);
 const requests=[];const svc=translationService({env:{CELITRIP_TRANSLATION_PROVIDER:'deepl',DEEPL_API_KEY:'synthetic-unit-test-key'},fetcher:async(url,options)=>{requests.push({url:String(url),body:JSON.parse(options.body)});return {ok:true,json:async()=>({translations:[{text:'Synthetic contract output'}]})};}});
 await svc.translate({source:'Only this field',sourceLocale:'he',privateNotes:'MUST NOT BE SENT',credentials:'MUST NOT BE SENT'});
 assert.equal(requests.length,3);assert.ok(requests.every(r=>JSON.stringify(r.body).includes('Only this field')&&!JSON.stringify(r.body).includes('MUST NOT')));
 const geo=translationService({fetcher:async url=>({ok:true,json:async()=>String(url).includes('wbsearchentities')?{search:[{id:'Q1'},{id:'Q2'}]}:{entities:{Q1:{id:'Q1',labels:{en:{value:'Same name'}},claims:{P17:[{mainsnak:{datavalue:{value:{id:'Q38'}}}}],P625:[{mainsnak:{datavalue:{value:{latitude:1}}}}],P31:[{mainsnak:{datavalue:{value:{id:'Q515'}}}}]}},Q2:{id:'Q2',labels:{en:{value:'Same name'}},claims:{P17:[{mainsnak:{datavalue:{value:{id:'Q30'}}}}],P625:[{mainsnak:{datavalue:{value:{latitude:2}}}}],P31:[{mainsnak:{datavalue:{value:{id:'Q515'}}}}]}}}}})});
 const found=await geo.geography({source:'Same name',sourceLocale:'en',kind:'city',country:'Q38'});assert.equal(found.length,1);assert.equal(found[0].identity.id,'Q1');assert.equal(found[0].labels.fr,'');
 await assert.rejects(geo.geography({source:'Same name',sourceLocale:'en',kind:'city'}),/countryIdentityRequired/);
 for(const l of ['he','en','fr','ru'])assert.ok(Object.values(destinationCopy(l)).every(v=>typeof v==='string'&&v.length));
});

test('geographic candidates with identical city names retain distinct regional context',async()=>{
 const statement=value=>({mainsnak:{datavalue:{value}}});
 const city=(id,region)=>({id,labels:{en:{value:'Same city'}},claims:{P17:[statement({id:'Q38'})],P31:[statement({id:'Q515'})],P625:[statement({latitude:1})],P131:[statement({id:region}),{...statement({id:'Q12'}),qualifiers:{P582:[{snaktype:'somevalue'}]}}]}});
 const service=translationService({fetcher:async url=>({ok:true,json:async()=>url.searchParams.get('action')==='wbsearchentities'?{search:[{id:'Q1'},{id:'Q2'}]}:url.searchParams.get('props')==='labels'?{entities:{Q11:{labels:{en:{value:'Region one'}}},Q12:{labels:{en:{value:'Region two'}}}}}:{entities:{Q1:city('Q1','Q11'),Q2:city('Q2','Q12')}}})});
 const candidates=await service.geography({kind:'city',country:'Q38',sourceLocale:'en',source:'Same city'});
 assert.equal(candidates.length,2);assert.deepEqual(candidates.map(c=>c.region),['Region one','Region two']);assert.notEqual(candidates[0].identity.id,candidates[1].identity.id);
});


test('geography submission validates only its saved revision; optional notes persist and action reasons are specific',async()=>{
 const svc=destinations(pool),names={en:'Disposable geography',he:'יעד בדיקה',fr:'Géographie fictive',ru:'Тестовое направление'};
 const made=await svc.save(adminP,{kind:'country',sourceLocale:'en',labels:names,mode:'fictional'});
 let r=await svc.read(adminP,made.id);assert.equal(r.internal_note,'');
 const action=(operation,extra={})=>svc.transition(adminP,{id:made.id,expected:r.revision_id,version:r.version,cycle:r.cycle,action:operation,...extra});
 await action('submit',{reason:'',labels:{},sourceLocale:'invalid-irrelevant-edit-field'});
 r=await svc.read(adminP,made.id);assert.equal(r.review_state,'review');assert.equal(r.reviews.length,0);
 await assert.rejects(action('publish'),e=>e.code==='confirmationRequired'&&e.fields.confirmGeography==='confirmationRequired');
 await assert.rejects(action('publish',{confirmGeography:true,guidance:'Unreviewed'}),/geographyOnly/);
 const before=(await pool.query('SELECT * FROM publication ORDER BY entity_id')).rows;
 await action('publish',{confirmGeography:true});r=await svc.read(adminP,made.id);
 assert.equal(r.reviews.length,0,'publication never manufactures review records');assert.equal((await repo.destination(made.id,'en')).title,names.en);
 assert.deepEqual((await pool.query('SELECT * FROM publication ORDER BY entity_id')).rows,before,'geography cannot move any content pointer');
 await assert.rejects(action('withdraw',{reason:''}),e=>e.code==='reasonRequired'&&e.fields.reason==='reasonRequired');
 await action('withdraw',{reason:'End fictional QA publication'});r=await svc.read(adminP,made.id);assert.equal(await repo.destination(made.id,'en'),null);
 await svc.save(adminP,{id:made.id,expected:r.revision_id,version:r.version,kind:'country',sourceLocale:'en',labels:names,internalNote:'Private organizational note'});
 r=await svc.read(adminP,made.id);assert.equal(r.internal_note,'Private organizational note');
 await svc.save(adminP,{id:made.id,expected:r.revision_id,version:r.version,kind:'country',sourceLocale:'en',labels:names});
 r=await svc.read(adminP,made.id);assert.equal(r.internal_note,'Private organizational note');
 await assert.rejects(svc.save(adminP,{id:made.id,expected:r.revision_id,version:r.version,kind:'country',sourceLocale:'en',labels:{...names,en:''}}),e=>e.code==='nameRequired'&&e.fields['labels.en']==='nameRequired');
 await assert.rejects(action('publish',{expected:made.revision,confirmGeography:true}),/conflict/);
 await action('archive',{reason:'Disposable QA archival'});r=await svc.read(adminP,made.id);assert.equal(r.state,'archived');
});

test('scoped editors can organize draft cities but cannot publish or escape their country',async()=>{
 const svc=destinations(pool),savedGrants=(await pool.query('SELECT * FROM editorial_grant WHERE user_id=$1',[adminP.userId])).rows;
 try{
  await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[adminP.userId]);await pool.query("INSERT INTO editorial_grant VALUES($1,'editor',$2,'*')",[adminP.userId,country.id]);
  const made=await svc.save(adminP,{kind:'city',parent:country.id,sourceLocale:'en',labels:{en:'Scoped draft child'},mode:'fictional'});
  const r=await svc.read(adminP,made.id);assert.equal(r.parent_id,country.id);assert.equal(await repo.destination(made.id,'en'),null);
  await assert.rejects(svc.transition(adminP,{id:made.id,expected:r.revision_id,version:r.version,cycle:r.cycle,action:'publish',confirmGeography:true}),/forbidden/);
  await assert.rejects(svc.save(adminP,{kind:'city',parent:'italy',sourceLocale:'en',labels:{en:'Wrong scope'}}),/forbidden/);
  await assert.rejects(svc.save(adminP,{kind:'country',sourceLocale:'en',labels:{en:'Wrong root scope'}}),/forbidden/);
 }finally{await pool.query('DELETE FROM editorial_grant WHERE user_id=$1',[adminP.userId]);for(const g of savedGrants)await pool.query('INSERT INTO editorial_grant VALUES($1,$2,$3,$4)',[g.user_id,g.role,g.scope,g.locale]);}
});

test('geographic labels cannot publish attached guidance or bypass branch subject/language gates',async()=>{
 await destinationAction('italy','publish');
 const svc=destinations(pool),r=await svc.read(adminP,'rome'),old=(await pool.query("SELECT * FROM publication WHERE entity_id='rome'")).rows;
 const body={id:'rome',expected:r.revision_id,version:r.version,cycle:r.cycle,action:'publish',confirmGeography:true};
 for(const field of ['claims','content','translations','document','contentRevision'])await assert.rejects(svc.transition(adminP,{...body,[field]:{unreviewed:true}}),/geographyOnly/);
 await svc.transition(adminP,body);assert.deepEqual((await pool.query("SELECT * FROM publication WHERE entity_id='rome'")).rows,old);
 const b=await service.save(adminP,null,null,document());await service.transition(adminP,b.id,b.revision,0,'submit',null,'Synthetic regression');
 await assert.rejects(service.transition(adminP,b.id,b.revision,0,'publish',null,'No subject or translation reviews'),/reviewsRequired/);
});
