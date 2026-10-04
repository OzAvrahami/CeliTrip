import {auth} from '@/server/auth';
import {readBody,errorResponse} from '@/server/editorial-http';
// Deliberate exposed surface: no signup, profile mutation, MFA disabling, or trusted devices.
const allowed=new Set(['sign-in/email','get-session','sign-out','two-factor/enable','two-factor/verify-totp','two-factor/verify-backup-code','revoke-sessions','revoke-other-sessions']);
async function handle(request){
  const path=new URL(request.url).pathname.replace('/api/auth/','');
  if(!allowed.has(path))return Response.json({error:'Not available'},{status:403});
  if(request.method==='POST'&&request.headers.get('origin')!=='http://127.0.0.1:3000')return Response.json({error:'Invalid origin'},{status:403});
  if(Number(request.headers.get('content-length')||0)>4096)return new Response(null,{status:413});
  const headers=new Headers(request.headers);headers.set('x-celitrip-local-ip','127.0.0.1');
  try{const body=request.method==='POST'?JSON.stringify(await readBody(request,4096)):undefined;
    headers.delete('content-length');const result=await auth.handler(new Request(request.url,{method:request.method,headers,body}));result.headers.set('Cache-Control','no-store');return result;
  }catch(error){return errorResponse(error);}
}
export const GET=handle;export const POST=handle;
