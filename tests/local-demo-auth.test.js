import test from 'node:test';
import assert from 'node:assert/strict';
import {localDemoAccount,localDemoEnabled,localDemoRequest,ownerDemoEmail} from '../src/server/local-demo-auth.js';

const env={CELITRIP_MODE:'local-fixtures',DATABASE_URL:'postgresql://localhost:55432/celitrip_test',CELITRIP_LOCAL_DEMO_PASSWORD_ONLY:'1'};
const headers=()=>new Headers({host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000','x-forwarded-for':'127.0.0.1','x-forwarded-proto':'http','x-forwarded-host':'127.0.0.1:3000'});
test('demo exception requires explicit opt-in and isolated fixture database, including optimized local builds',()=>{
  assert.equal(localDemoAccount(ownerDemoEmail,headers(),env),true);
  assert.equal(localDemoAccount(ownerDemoEmail,headers(),{...env,NODE_ENV:'production'}),true);
  for(const flag of [undefined,'0','true','yes'])assert.equal(localDemoEnabled({...env,CELITRIP_LOCAL_DEMO_PASSWORD_ONLY:flag}),false);
  for(const mode of [undefined,'production','real-content'])assert.equal(localDemoEnabled({...env,CELITRIP_MODE:mode}),false);
  for(const url of ['postgresql://remote.invalid:55432/celitrip_test','postgresql://localhost:5432/celitrip_test','postgresql://localhost:55432/production','invalid'])assert.equal(localDemoEnabled({...env,DATABASE_URL:url}),false);
  for(const key of ['RAILWAY_ENVIRONMENT_ID','RAILWAY_ENVIRONMENT_NAME','RAILWAY_PROJECT_ID','VERCEL','VERCEL_ENV','RENDER','RENDER_SERVICE_ID','NETLIFY','FLY_APP_NAME','AWS_EXECUTION_ENV','K_SERVICE','WEBSITE_SITE_NAME','KUBERNETES_SERVICE_HOST'])assert.equal(localDemoEnabled({...env,[key]:'production'}),false,key);
  for(const key of ['BETTER_AUTH_URL','NEXT_PUBLIC_APP_URL'])assert.equal(localDemoEnabled({...env,[key]:'https://celitrip.example'}),false,key);
});
test('request and exact identity restrictions reject external, missing, forwarded and client-selected bypasses',()=>{
  for(const email of [null,'other@demo.invalid','owner-demo@example.com','OWNER-DEMO@demo.invalid'])assert.equal(localDemoAccount(email,headers(),env),false);
  assert.equal(localDemoRequest(null,env),false);
  assert.equal(localDemoRequest(new Headers(),env),false);
  for(const [key,value] of [['host','remote.invalid:3000'],['host','localhost:3000'],['host','127.0.0.1:80'],['forwarded','for=127.0.0.1'],['x-forwarded-for','203.0.113.1'],['x-forwarded-for','127.0.0.1, 127.0.0.1'],['x-forwarded-host','public.example'],['x-forwarded-proto','https'],['origin','https://public.example']]){
    const h=headers();h.set(key,value);assert.equal(localDemoRequest(h,env),false,`${key}: ${value}`);
  }
  const h=headers();h.set('CELITRIP_LOCAL_DEMO_PASSWORD_ONLY','1');h.set('x-demo-mode','true');
  assert.equal(localDemoRequest(h,{...env,CELITRIP_LOCAL_DEMO_PASSWORD_ONLY:'0'}),false);
});
