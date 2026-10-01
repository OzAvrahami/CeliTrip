#!/usr/bin/env node
'use strict';

// VERSION.json is authoritative. Keep the standalone review artifact self-contained.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check') || args.length > 1) {
  console.error('Usage: node scripts/sync-prototype-version.cjs [--check]');
  process.exit(1);
}

try {
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'VERSION.json'), 'utf8'));
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(metadata.version) ||
      !['unreleased', 'released'].includes(metadata.status)) {
    throw new Error('VERSION.json must contain a numeric major.minor.patch version and an unreleased/released status.');
  }
  const file = path.join(root, 'docs/design/CeliTrip-Design-Flow.html');
  const html = fs.readFileSync(file, 'utf8');
  const start = '<!-- product-version:start -->';
  const end = '<!-- product-version:end -->';
  if (html.split(start).length !== 2 || html.split(end).length !== 2 || html.indexOf(end) < html.indexOf(start)) {
    throw new Error('Expected exactly one correctly ordered product-version block in the prototype.');
  }
  const status = metadata.status === 'unreleased' ? 'Unreleased' : 'Released';
  const generated = `${start}<span class="product-version" id="product-version" lang="en" dir="ltr">v${metadata.version} · ${status}</span>${end}`;
  const a = html.indexOf(start), b = html.indexOf(end) + end.length;
  const current = html.slice(a, b);
  if (args.includes('--check')) {
    if (current !== generated) throw new Error('Prototype version badge is stale. Run node scripts/sync-prototype-version.cjs.');
    console.log(`Version consistent: ${metadata.version} (${metadata.status}).`);
  } else if (current !== generated) {
    fs.writeFileSync(file, html.slice(0, a) + generated + html.slice(b), 'utf8');
    console.log(`Prototype badge updated: ${metadata.version} (${metadata.status}).`);
  } else {
    console.log(`Already current: ${metadata.version} (${metadata.status}).`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
