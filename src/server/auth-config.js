import { betterAuth } from 'better-auth';
import { twoFactor } from 'better-auth/plugins';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { localConfig } from './local-config.js';
import { localDemoAccount } from './local-demo-auth.js';

/** Shared by the application and isolated integration tests. No public account creation. */
export function authOptions(pool, env = process.env) {
  localConfig(env);
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) throw new Error('Configure the local authentication secret with auth:configure.');
  const mfa = twoFactor({issuer:'CeliTrip local demo',skipVerificationOnEnable:false});
  // Better Auth 1.7.7 performs its password challenge in this after hook.
  // Narrow only its matcher; preserve all credential, cookie, TOTP and recovery primitives.
  mfa.hooks.after = mfa.hooks.after.map(hook => ({...hook, matcher:ctx =>
    hook.matcher(ctx) && !(ctx.path === '/sign-in/email' &&
      localDemoAccount(ctx.context.newSession?.user.email, ctx.headers, env))}));
  return {
    appName: 'CeliTrip local demo', baseURL: 'http://127.0.0.1:3000',
    secret: env.BETTER_AUTH_SECRET, database: pool,
    trustedOrigins: ['http://127.0.0.1:3000'],
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 14 },
    session: { expiresIn: 8 * 3600, updateAge: 1800, cookieCache: { enabled: false }, additionalFields: { mfaVerified: {type:'boolean', defaultValue:false, input:false}, localDemoPassword: {type:'boolean',defaultValue:false,input:false} } },
    advanced: { cookiePrefix:'celitrip', defaultCookieAttributes:{httpOnly:true,sameSite:'lax'}, ipAddress:{ipAddressHeaders:['x-celitrip-local-ip']} },
    rateLimit: { enabled:true, storage:'database', window:60, max:100, customRules:{'/sign-in/email':{window:60,max:5},'/two-factor/*':{window:60,max:10}} },
    plugins:[mfa],
    hooks: {
      before:createAuthMiddleware(async ctx=>{
        if(ctx.path==='/sign-in/email'&&typeof ctx.body?.email==='string'&&(await pool.query('SELECT 1 FROM "user" u JOIN admin_access a ON a.user_id=u.id WHERE lower(u.email)=lower($1) AND a.disabled',[ctx.body.email])).rowCount)throw new APIError('UNAUTHORIZED',{message:'Invalid credentials'});
        if(ctx.body?.trustDevice || ctx.path==='/two-factor/disable' || ctx.body?.method==='otp') throw new APIError('FORBIDDEN',{message:'TOTP is mandatory; operator recovery is required.'});
      }),
      after:createAuthMiddleware(async ctx=>{
        if(ctx.path === '/sign-in/email' && !(ctx.context.returned instanceof APIError) &&
          localDemoAccount(ctx.context.newSession?.user.email, ctx.headers, env)) {
          await pool.query('UPDATE session SET "localDemoPassword"=true WHERE id=$1',[ctx.context.newSession.session.id]);
        }
        if(ctx.path !== '/two-factor/verify-totp' || ctx.context.returned instanceof APIError) return;
        const verified = ctx.context.newSession || ctx.context.session;
        if(verified?.session?.id && (ctx.context.returned?.status === true || ctx.context.returned?.token || ctx.context.newSession)) {
          await pool.query('UPDATE session SET "mfaVerified"=true WHERE id=$1',[verified.session.id]);
        }
      })
    }
  };
}
export const createAuth = (pool, env) => betterAuth(authOptions(pool, env));
