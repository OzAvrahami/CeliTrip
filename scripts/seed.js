import pg from 'pg';
import { localConfig } from '../src/server/local-config.js';
import { seed } from '../db/seeds/rome.js';
const client = new pg.Client(localConfig());
await client.connect();
try { await seed(client); console.log('Fictional fixtures present; existing revisions preserved.'); }
finally { await client.end(); }
