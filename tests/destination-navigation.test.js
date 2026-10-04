import test from 'node:test';
import assert from 'node:assert/strict';
import {destinationContext,destinationList,destinationQuery} from '../src/lib/destination-navigation.js';
import {geographyCopy} from '../src/i18n/geography.js';
test('destination return context retains bounded list controls without arbitrary redirects',()=>{
 const from={q:'QA country',kind:'country',state:'draft',sort:'name',page:'2',destination:'country-id',redirect:'https://untrusted.invalid'};
 const context=destinationContext(from);
 assert.equal(destinationList('he',context),'/he/editor/destinations?q=QA+country&kind=country&state=draft&destination=country-id&sort=name&page=2');
 assert.equal(destinationQuery(context),'?from='+encodeURIComponent(context));
 assert.equal(destinationList('en','https://untrusted.invalid'),'/en/editor/destinations');
 assert.equal(destinationContext({q:'x'.repeat(161),page:['1','2']}),'');
});
test('geography usability messages cover all four interface languages',()=>{
 for(const l of ['en','he','fr','ru']){const t=geographyCopy(l);assert.deepEqual(Object.keys(t),Object.keys(geographyCopy('en')));assert.ok(Object.values(t).every(v=>typeof v==='string'&&v.length&&!v.includes('\ufffd')));}
});
