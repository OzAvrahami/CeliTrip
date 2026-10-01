import { NextResponse } from 'next/server';
import { isLocalRequest } from './server/local-config';

export function proxy(request) {
  if (process.env.CELITRIP_MODE !== 'local-fixtures' || process.env.RAILWAY_ENVIRONMENT_ID ||
      process.env.VERCEL || process.env.RENDER ||
      !isLocalRequest(request.headers.get('host'), request.headers.get('x-forwarded-host')) ||
      request.headers.has('forwarded')) {
    return new NextResponse('Local demonstration only. Public access is disabled.', { status: 403 });
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-celitrip-locale', request.nextUrl.pathname.split('/')[1] || 'en');
  const response = NextResponse.next({request:{headers:requestHeaders}});
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
