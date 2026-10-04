import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{releaseLabel}=require('../src/lib/release-label.cjs');
const script=fileURLToPath(new URL('../scripts/check-version.js',import.meta.url));
const actual=JSON.parse(readFileSync(new URL('../VERSION.json',import.meta.url),'utf8'));
const metadata={version:'0.3.0',status:'unreleased',release_history:(actual.release_history||[]).filter(r=>r.version==='0.2.0')};
function check(value){const dir=mkdtempSync(path.join(tmpdir(),'celitrip-version-'));try{
 for(const [file,body] of Object.entries({'VERSION.json':value,'package.json':{version:value.version},'package-lock.json':{version:value.version,packages:{'':{version:value.version}}}}))writeFileSync(path.join(dir,file),JSON.stringify(body));
 return spawnSync(process.execPath,[script],{cwd:dir,encoding:'utf8'}).status;
}finally{assert.equal(path.dirname(path.resolve(dir)),path.resolve(tmpdir()));assert.ok(path.basename(dir).startsWith('celitrip-version-'));rmSync(dir,{recursive:true,force:true});}}
test('unreleased checkpoint preserves distinct historical publication without inheriting its label',()=>{
 assert.equal(check(metadata),0);assert.equal(metadata.status,'unreleased');assert.equal(metadata.release,undefined);assert.equal(releaseLabel(metadata),'Unreleased');
 const historical=metadata.release_history.find(r=>r.version==='0.2.0');assert.equal(historical.tag_commit,'8d329a6d5a1dafa561772f0536e3c7811e1e2739');assert.equal(historical.channel,'prerelease');assert.equal(historical.state,'published');
 assert.equal(releaseLabel({status:'released',release:historical}),'Published prerelease');
});
test('version checks reject carried-over, duplicate or incomplete publication metadata',()=>{
 const h=metadata.release_history[0];
 assert.notEqual(check({...metadata,release:h}),0);
 assert.notEqual(check({...metadata,status:'released'}),0);
 assert.notEqual(check({...metadata,release_history:[h,h]}),0);
 assert.notEqual(check({...metadata,release_history:[{...h,tag_commit:''}]}),0);
 assert.notEqual(check({...metadata,release_history:[{...h,state:'prepared'}]}),0);
});
