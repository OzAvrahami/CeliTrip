import {localConfig} from './local-config.js';

export const ownerDemoEmail = 'owner-demo@demo.invalid';

/** Server-only policy: an explicit opt-in never overrides the fixture/database guard. */
export function localDemoEnabled(env = process.env) {
  if (env.CELITRIP_LOCAL_DEMO_PASSWORD_ONLY !== '1') return false;
  try { localConfig(env); } catch { return false; }
  if (['RAILWAY_ENVIRONMENT_NAME','RAILWAY_PROJECT_ID','VERCEL_ENV','RENDER_SERVICE_ID',
    'NETLIFY','FLY_APP_NAME','AWS_EXECUTION_ENV','K_SERVICE','WEBSITE_SITE_NAME',
    'KUBERNETES_SERVICE_HOST'].some(key => env[key])) return false;
  if ([env.BETTER_AUTH_URL,env.NEXT_PUBLIC_APP_URL].some(url => url && url !== 'http://127.0.0.1:3000')) return false;
  return true;
}

/** Headers come from the server request, never an action body or client flag.
 * The preview launcher binds 127.0.0.1. Proxy/forwarding headers are rejected.
 */
export function localDemoRequest(headers, env = process.env) {
  if (!localDemoEnabled(env) || !headers?.get) return false;
  if (headers.get('host') !== '127.0.0.1:3000' || headers.has('forwarded')) return false;
  if (headers.has('x-forwarded-host') && headers.get('x-forwarded-host') !== '127.0.0.1:3000') return false;
  if (headers.has('x-forwarded-proto') && headers.get('x-forwarded-proto') !== 'http') return false;
  if (headers.has('x-forwarded-for') && !['127.0.0.1','::ffff:127.0.0.1'].includes(headers.get('x-forwarded-for'))) return false;
  if (headers.has('origin') && headers.get('origin') !== 'http://127.0.0.1:3000') return false;
  return true;
}

export const localDemoAccount = (email, headers, env = process.env) =>
  email === ownerDemoEmail && localDemoRequest(headers, env);
