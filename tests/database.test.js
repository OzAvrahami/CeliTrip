import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import {runner} from 'node-pg-migrate';
import {localConfig} from '../src/server/local-config.js';
import {repository} from '../src/server/repository.js';
import {seed} from '../db/seeds/rome.js';
let db,repo,url;
const migration = direction => runner({databaseUrl:url,dir:'db/migrations',direction,count:Infinity,migrationsTable:'pgmigrations',log:()=>{}});
before(async()=>{
  const config=localConfig();const admin=new pg.Client(config);await admin.connect();
  try {if(!(await admin.query("SELECT 1 FROM pg_database WHERE datname='celitrip_test'")).rowCount)await admin.query('CREATE DATABASE celitrip_test');}finally{await admin.end();}
  const parsed=new URL(config.connectionString);parsed.pathname='/celitrip_test';url=parsed.href;
  localConfig({...process.env,DATABASE_URL:url});
  await migration('up');
  db=new pg.Client({connectionString:url});await db.connect();repo=repository(db);await seed(db);
});
after(async()=>{await db?.end();});
test('migrations rerun and fixtures repeat without changing counts or published revisions',async()=>{
  const snapshot=async()=>JSON.stringify((await db.query(`SELECT (SELECT count(*) FROM entity) AS entities,(SELECT count(*) FROM content_revision) AS revisions,(SELECT count(*) FROM observation) AS observations,(SELECT count(*) FROM translation_revision) AS translations,(SELECT jsonb_agg(p ORDER BY entity_id) FROM publication p) AS publications`)).rows);
  const first=await snapshot();await migration('up');await seed(db);assert.equal(await snapshot(),first);
});
test('all four locales use published revision 1 while newer draft and draft-only branch are hidden',async()=>{
  for(const locale of ['he','en','fr','ru']){
    const rows=await repo.places(locale);assert.equal(rows.length,3);
    assert.equal((await repo.entity('forno-demo',locale)).revision_id,'forno-v1');
    assert.equal(await repo.entity('draft-only',locale),null);
    assert.equal((await repo.evidence('forno-demo',locale)).some(c=>c.id==='draft-secret'),false);
    assert.equal((await repo.places(locale,{q:'DRAFT SECRET'})).length,0);
    assert.ok((await repo.entity('rome',locale)).summary);
  }
});
test('multi-category and cross-language search, combined filters, injection and empty results',async()=>{
  for(const category of ['bakery','cafe','grocery'])assert.ok((await repo.places('en',{category})).some(p=>p.id==='forno-demo'));
  assert.equal((await repo.places('he',{q:'Форно'}))[0].id,'forno-demo');
  assert.equal((await repo.places('en',{category:'restaurant',dimension:'conflicting'})).length,0);
  assert.equal((await repo.places('en',{q:"' OR 1=1 --"})).length,0);
});
test('five evidence dimensions coexist without chain-to-branch promotion; contradictory source history stays',async()=>{
  const a=await repo.evidence('forno-demo','en'),b=await repo.evidence('tavola-demo','en');
  assert.deepEqual([...new Set([...a,...b].flatMap(c=>c.dimensions))].sort(),['chain_scope','conflicting','historical','needs_review','unknown']);
  const conflict=a.find(c=>c.id==='fryer');assert.equal(conflict.value,null);
  assert.deepEqual(conflict.observations.map(o=>o.stance),['supports','contradicts']);
  assert.deepEqual(conflict.observations.map(o=>o.sourceRevision),[1,2]);
  assert.equal(b[0].scope,'chain');assert.equal(b[0].subject_id,'demo-chain');assert.ok(b[0].dimensions.includes('unknown'));
  for(const c of [...a,...b])for(const o of c.observations){assert.equal(o.verifiedOn,null);assert.equal(o.observedOn,null);assert.equal(o.url,null);}
});
test('database rejects draft publication and mutation of preserved revisions',async()=>{
  await assert.rejects(db.query("UPDATE publication SET revision_id='forno-v2' WHERE entity_id='forno-demo'"),/Draft revision/);
  await assert.rejects(db.query("UPDATE source_revision SET published_on=CURRENT_DATE WHERE id='venue-1'"),/Append a new revision/);
  assert.equal((await repo.entity('forno-demo','en')).revision_id,'forno-v1');
});
test('fresh connection reads persisted records',async()=>{
  const other=new pg.Client({connectionString:url});await other.connect();
  try{assert.equal((await repository(other).places('ru')).length,3);}finally{await other.end();}
});
test('wrong branch and chain observations cannot be attached as branch evidence',async()=>{
  await assert.rejects(db.query("INSERT INTO claim_revision VALUES('wrong-branch','forno-v1','tavola-demo','test',NULL,ARRAY['unknown'],'{}')"),/another branch/);
  await assert.rejects(db.query("INSERT INTO observation(id,claim_id,source_revision_id,stance,statement) VALUES('wrong-source','fryer','chain-1','supports','{}')"),/scope must match/);
});
test('migration rollback/reapply works only in disposable celitrip_test',async()=>{
  assert.equal(new URL(url).pathname,'/celitrip_test');
  await migration('down');await migration('up');await seed(db);
  assert.equal((await repo.places('en')).length,3);
});
