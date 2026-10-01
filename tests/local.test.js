import test from 'node:test';
import assert from 'node:assert/strict';
import {localConfig,isLocalRequest} from '../src/server/local-config.js';
import {filtersFrom,filterQuery} from '../src/server/repository.js';
import {dictionaries} from '../src/i18n/copy.js';
test('fixture configuration fails closed outside named local databases',()=>{
  const base={CELITRIP_MODE:'local-fixtures',DATABASE_URL:'postgresql://celitrip:local@127.0.0.1:55432/celitrip_dev'};
  assert.ok(localConfig(base));
  for(const change of [{CELITRIP_MODE:'production'},{RAILWAY_ENVIRONMENT_ID:'x'},{VERCEL:'1'},{DATABASE_URL:'postgresql://example.com/db'},{DATABASE_URL:base.DATABASE_URL.replace('celitrip_dev','other_project')}]) assert.throws(()=>localConfig({...base,...change}));
  assert.equal(isLocalRequest('127.0.0.1:3000',null),true);
  for(const host of ['example.com','192.168.1.4:3000','localhost.evil:3000','127.0.0.1:4444'])assert.equal(isLocalRequest(host,null),false);
  assert.equal(isLocalRequest('127.0.0.1:3000','example.com'),false);
});
test('filters are bounded, deterministic, and cannot request drafts',()=>{
  assert.deepEqual(filtersFrom({category:['bakery'],dimension:'bogus',draft:'true',q:' x '}),{category:'',dimension:'',q:'x'});
  assert.equal(filterQuery({category:'bakery',dimension:'conflicting',q:'רומא'}),'?category=bakery&dimension=conflicting&q=%D7%A8%D7%95%D7%9E%D7%90');
  assert.equal(filtersFrom({q:'x'.repeat(200)}).q.length,80);
});
test('four interface dictionaries have identical, nonempty keys',()=>{
  const keys=Object.keys(dictionaries.en);
  for(const dict of Object.values(dictionaries)){assert.deepEqual(Object.keys(dict),keys);for(const value of Object.values(dict))assert.ok(typeof value==='string'&&value.length);}
});
