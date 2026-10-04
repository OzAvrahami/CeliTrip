import { readFileSync } from 'node:fs';
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const metadata = read('VERSION.json');
const version = metadata.version;
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version) || !['unreleased','released'].includes(metadata.status)) {
  throw new Error('Invalid authoritative version/status');
}
const lock = read('package-lock.json');
if ([read('package.json').version, lock.version, lock.packages[''].version].some(value => value !== version)) {
  throw new Error('Package and lockfile versions must mirror VERSION.json');
}
function validateRelease(release,version,status) {
  if (release.tag !== `v${version}` || !['prerelease','stable'].includes(release.channel) ||
      !['prepared','published'].includes(release.state) ||
      (status === 'released') !== (release.state === 'published')) {
    throw new Error('Release metadata must agree with the product version and publication status');
  }
  if (release.state === 'published' &&
      (!/^[0-9a-f]{40}$/.test(release.tag_commit || '') ||
       !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(release.published_at || '') ||
       !Number.isFinite(Date.parse(release.published_at)) ||
       release.url !== `https://github.com/OzAvrahami/CeliTrip/releases/tag/${release.tag}`)) {
    throw new Error('Published releases require a tag target, UTC publication time and matching GitHub URL');
  }
}
if (metadata.release) validateRelease(metadata.release,version,metadata.status);
else if (metadata.status === 'released') throw new Error('Released versions require publication metadata');
if (metadata.release_history !== undefined && !Array.isArray(metadata.release_history)) throw new Error('Release history must be an array');
const seen=new Set([version]);
for (const entry of metadata.release_history || []) {
  if (!entry || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(entry.version) || seen.has(entry.version) || entry.state!=='published') {
    throw new Error('Historical versions must be distinct published releases');
  }
  validateRelease(entry,entry.version,'released');
  seen.add(entry.version);
}
console.log('Package and lockfile versions match authority.');
console.log('Release metadata is consistent.');
