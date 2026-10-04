import 'server-only';
import {pool} from './db';
import {createAuth} from './auth-config';
export const auth = createAuth(pool);
