import 'server-only';
import pg from 'pg';
import { localConfig } from './local-config';
import { repository } from './repository';
const pool = new pg.Pool({...localConfig(),max:4,connectionTimeoutMillis:2500,idleTimeoutMillis:10000,allowExitOnIdle:true});
pool.on('error', () => console.error('Local database connection interrupted.'));
export const content = repository(pool);
