import { readFileSync } from 'node:fs';
const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const version = read('VERSION.json').version;
const lock = read('package-lock.json');
if ([read('package.json').version, lock.version, lock.packages[''].version].some(value => value !== version)) {
  throw new Error('Package and lockfile versions must mirror VERSION.json');
}
console.log('Package and lockfile versions match authority.');
