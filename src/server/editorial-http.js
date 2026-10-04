import 'server-only';
import {auth} from './auth';
import {DomainError,fail} from './editorial-validation';
export async function principal(headers){const result=await auth.api.getSession({headers});if(!result)fail('signInRequired',401);return {userId:result.user.id,sessionId:result.session.id,requestHeaders:headers};}
export async function readBody(request,limit=150000){
  if(request.headers.get('origin')!=='http://127.0.0.1:3000')fail('forbidden',403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))fail('invalid');
  const reader=request.body?.getReader();if(!reader)fail('invalid');let size=0;const chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();fail('tooLarge',413);}chunks.push(value);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail('invalid');}
}
export const response=value=>Response.json(value,{headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
export function errorResponse(error){if(error instanceof DomainError)return responseWithStatus({error:error.code,...(error.fields?{fields:error.fields}:{})},error.status);console.error('Editorial request failed.',error.code||error.name);return responseWithStatus({error:'serverError'},500);}
const responseWithStatus=(value,status)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
