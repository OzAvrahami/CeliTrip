/** Reject accidental cloud/production data use, even for a locally built production bundle. */
export function localConfig(env = process.env) {
  if (env.CELITRIP_MODE !== 'local-fixtures' || env.RAILWAY_ENVIRONMENT_ID || env.VERCEL || env.RENDER) {
    throw new Error('Milestone 1 is restricted to local fixtures. Public operation is disabled.');
  }
  const url = new URL(env.DATABASE_URL || 'invalid:');
  if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
      !['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== '55432' ||
      !['/celitrip_dev', '/celitrip_test'].includes(url.pathname)) {
    throw new Error('Use only the isolated CeliTrip PostgreSQL on loopback port 55432.');
  }
  return { connectionString: url.href };
}

export function isLocalRequest(host, forwardedHost) {
  // Next supplies x-forwarded-host itself; reject mismatches and non-loopback hosts.
  return (!forwardedHost || forwardedHost === host) && /^(127\.0\.0\.1|localhost):3000$/.test(host || '');
}
