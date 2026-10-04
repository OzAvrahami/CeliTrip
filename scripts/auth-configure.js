import {randomBytes} from 'node:crypto';
import {readFileSync,appendFileSync} from 'node:fs';
const file='.env.local';
const current=readFileSync(file,'utf8');
if(/^BETTER_AUTH_SECRET=/m.test(current)) console.log('Existing authentication secret preserved.');
else {appendFileSync(file,`\nBETTER_AUTH_SECRET=${randomBytes(48).toString('base64url')}\n`);console.log('Authentication secret appended to ignored .env.local. Keep this file private.');}
